import Bet from '../../models/bet.model.js';
import LotteryDraw from '../../models/lotteryDraw.model.js';
import User from '../../models/user.model.js';
import CreditTransaction from '../../models/creditTransaction.model.js';
import AppError from '../../utils/AppError.js';
import { successResponse } from '../../utils/response.js';
import mongoose from 'mongoose';

/**
 * POST /api/v1/member/bets
 * Place a new bet
 */
export const placeBet = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const memberId = req.user._id;
    const { lottery_draw_id, bet_items, note } = req.body;

    // 1. Validate request body
    if (!lottery_draw_id) {
      throw new AppError('กรุณาระบุงวดหวยที่ต้องการแทง', 400);
    }

    if (!bet_items || !Array.isArray(bet_items) || bet_items.length === 0) {
      throw new AppError('กรุณาเพิ่มรายการเลขที่ต้องการแทง', 400);
    }

    // 2. Get member data with agent info
    const member = await User.findById(memberId).session(session);
    if (!member) {
      throw new AppError('ไม่พบข้อมูลสมาชิก', 404);
    }

    if (member.status !== 'active') {
      throw new AppError('บัญชีของคุณถูกระงับ ไม่สามารถแทงหวยได้', 403);
    }

    if (!member.parent_id) {
      throw new AppError('ไม่พบข้อมูล Agent', 404);
    }

    // 3. Get agent data
    const agent = await User.findById(member.parent_id).session(session);
    if (!agent) {
      throw new AppError('ไม่พบข้อมูล Agent', 404);
    }

    if (agent.status !== 'active') {
      throw new AppError('Agent ของคุณถูกระงับ ไม่สามารถแทงหวยได้', 403);
    }

    // 4. Get lottery draw data
    const lotteryDraw = await LotteryDraw.findById(lottery_draw_id).session(session);
    if (!lotteryDraw) {
      throw new AppError('ไม่พบข้อมูลงวดหวย', 404);
    }

    // 5. Validate lottery draw status and time
    const now = new Date();
    const openTime = new Date(lotteryDraw.open_time);
    const closeTime = new Date(lotteryDraw.close_time);

    if (lotteryDraw.status !== 'open') {
      throw new AppError('งวดหวยนี้ปิดรับแทงแล้ว', 400);
    }

    if (now < openTime) {
      throw new AppError('ยังไม่ถึงเวลาเปิดรับแทง', 400);
    }

    if (now >= closeTime) {
      throw new AppError('เลยเวลาปิดรับแทงแล้ว', 400);
    }

    // 6. Validate and process bet items
    const processedBetItems = [];
    let totalAmount = 0;
    let totalPotentialWin = 0;

    // Helper function to get digit count for bet type
    const getDigitCount = (betType) => {
      const digitMap = {
        three_top: 3,
        three_tod: 3,
        two_top: 2,
        two_bottom: 2,
        run_top: 1,
        run_bottom: 1,
      };
      return digitMap[betType] || 0;
    };

    // Validate each bet item
    for (const item of bet_items) {
      const { bet_type, number, amount } = item;

      // Validate bet_type
      if (!bet_type || !['three_top', 'three_tod', 'two_top', 'two_bottom', 'run_top', 'run_bottom'].includes(bet_type)) {
        throw new AppError(`ประเภทการแทงไม่ถูกต้อง: ${bet_type}`, 400);
      }

      // Get bet settings for this type
      const betSettings = lotteryDraw.bet_settings[bet_type];
      if (!betSettings || !betSettings.enabled) {
        throw new AppError(`ประเภท ${bet_type} ปิดรับแทงในงวดนี้`, 400);
      }

      // Validate number format
      if (!number || typeof number !== 'string') {
        throw new AppError('กรุณากรอกเลขที่ต้องการแทง', 400);
      }

      const requiredDigits = getDigitCount(bet_type);
      if (number.length !== requiredDigits) {
        throw new AppError(`เลข ${bet_type} ต้องมี ${requiredDigits} หลัก`, 400);
      }

      // Check if number contains only digits
      if (!/^\d+$/.test(number)) {
        throw new AppError('เลขต้องเป็นตัวเลข 0-9 เท่านั้น', 400);
      }

      // Validate amount
      if (!amount || typeof amount !== 'number' || amount <= 0) {
        throw new AppError('จำนวนเงินต้องมากกว่า 0', 400);
      }

      if (amount < betSettings.min_bet) {
        throw new AppError(`${bet_type}: ขั้นต่ำ ${betSettings.min_bet} บาท`, 400);
      }

      if (amount > betSettings.max_bet) {
        throw new AppError(`${bet_type}: สูงสุด ${betSettings.max_bet} บาท`, 400);
      }

      // Calculate potential win
      const potentialWin = amount * betSettings.payout_rate;

      // Add to processed items
      processedBetItems.push({
        bet_type,
        number,
        amount,
        payout_rate: betSettings.payout_rate,
        potential_win: potentialWin,
      });

      totalAmount += amount;
      totalPotentialWin += potentialWin;
    }

    // 7. Check if member has sufficient credit
    // Credit is the limit, balance can go negative within credit limit
    const availableCredit = (member.credit || 0) + (member.balance || 0);
    if (availableCredit < totalAmount) {
      throw new AppError(
        `เครดิตไม่เพียงพอ (ใช้ได้ ${availableCredit.toLocaleString()} บาท ต้องการ ${totalAmount.toLocaleString()} บาท)`,
        400
      );
    }

    // 8. Get commission rates from member's commission_rates
    // Find commission rates for this lottery type
    const memberCommissionRates = member.commission_rates?.find(
      (cr) => cr.lottery_type_id?.toString() === lotteryDraw.lottery_type
    );

    const agentCommissionRates = agent.commission_rates?.find(
      (cr) => cr.lottery_type_id?.toString() === lotteryDraw.lottery_type
    );

    // Calculate commission for each bet type
    const calculateCommissionByType = (betItems, rates) => {
      let totalCommission = 0;
      if (!rates) return totalCommission;

      for (const item of betItems) {
        const rate = rates.rates?.[item.bet_type] || 0;
        const commission = (item.amount * rate) / 100;
        totalCommission += commission;
      }
      return totalCommission;
    };

    const memberCommission = calculateCommissionByType(processedBetItems, memberCommissionRates);
    const agentCommission = calculateCommissionByType(processedBetItems, agentCommissionRates);

    // 9. Deduct from balance (credit stays as limit)
    // Credit = ขีดจำกัด (ไม่เปลี่ยน)
    // Balance = เงินจริง (สามารถติดลบได้ภายในกรอบ credit)
    const balanceBefore = member.balance || 0;
    member.balance = balanceBefore - totalAmount;

    await member.save({ session });

    // 10. Create credit transaction record
    await CreditTransaction.create(
      [
        {
          performed_by: memberId,
          downline_id: memberId,
          action: 'deduct',
          amount: totalAmount,
          balance_before: balanceBefore,
          balance_after: member.balance,
          note: `แทงหวย ${lotteryDraw.lottery_type} งวดวันที่ ${new Date(lotteryDraw.draw_date).toLocaleDateString('th-TH')}`,
        },
      ],
      { session }
    );

    // 11. Create bet record
    const bet = await Bet.create(
      [
        {
          member_id: memberId,
          agent_id: agent._id,
          lottery_draw_id,
          bet_items: processedBetItems,
          total_amount: totalAmount,
          total_potential_win: totalPotentialWin,
          status: 'pending',
          note: note?.trim() || null, // Save note if provided
          commission_data: {
            agent: {
              rates: agentCommissionRates?.rates || {},
              total_commission: agentCommission,
            },
            master: {
              rates: memberCommissionRates?.rates || {},
              total_commission: memberCommission,
            },
          },
        },
      ],
      { session }
    );

    // 12. Commit transaction
    await session.commitTransaction();

    // 13. Populate bet data for response
    const populatedBet = await Bet.findById(bet[0]._id)
      .populate('member_id', 'username name')
      .populate('agent_id', 'username name')
      .populate('lottery_draw_id', 'lottery_type draw_date close_time')
      .lean();

    return successResponse(res, 'แทงหวยสำเร็จ', {
      bet: populatedBet,
      deducted: {
        credit: deductedFromCredit,
        balance: deductedFromBalance,
        total: totalAmount,
      },
      remaining: {
        credit: member.credit,
        balance: member.balance,
        total: member.credit + member.balance,
      },
    }, 201);
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

/**
 * GET /api/v1/member/bets
 * Get member's bet history
 */
export const getBets = async (req, res, next) => {
  try {
    const memberId = req.user._id;
    const { lottery_draw_id, status, limit = 50, page = 1 } = req.query;

    // Build query options
    const options = {};
    if (lottery_draw_id) {
      options.lottery_draw_id = lottery_draw_id;
    }
    if (status) {
      options.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Find bets
    const bets = await Bet.findByMember(memberId, options)
      .populate('lottery_draw_id', 'lottery_type draw_date close_time status')
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // Get total count
    const totalQuery = { member_id: memberId, ...options };
    const total = await Bet.countDocuments(totalQuery);

    return successResponse(res, 'ดึงข้อมูลประวัติการแทงสำเร็จ', {
      bets,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    }, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/member/bets/:id
 * Get bet by ID
 */
export const getBetById = async (req, res, next) => {
  try {
    const memberId = req.user._id;
    const { id } = req.params;

    // Find bet
    const bet = await Bet.findById(id)
      .populate('member_id', 'username name')
      .populate('agent_id', 'username name')
      .populate('lottery_draw_id', 'lottery_type draw_date close_time status result')
      .lean();

    if (!bet) {
      throw new AppError('ไม่พบข้อมูลบิล', 404);
    }

    // Check ownership
    if (bet.member_id._id.toString() !== memberId.toString()) {
      throw new AppError('คุณไม่มีสิทธิ์ดูบิลนี้', 403);
    }

    return successResponse(res, 'ดึงข้อมูลบิลสำเร็จ', { bet }, 200);
  } catch (error) {
    next(error);
  }
};
