import LotteryDraw from '../../models/lotteryDraw.model.js';
import LotteryType from '../../models/lotteryType.model.js';
import AppError from '../../utils/AppError.js';
import { successResponse } from '../../utils/response.js';

// GET /api/v1/member/lottery-draws
// Get lottery draws with optional filters
export const getLotteryDraws = async (req, res, next) => {
  try {
    const { lottery_type, status, limit = 100, page = 1 } = req.query;

    // Build query
    const query = {};

    // Filter by lottery type if provided
    if (lottery_type) {
      query.lottery_type = lottery_type;
    }

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Find lottery draws with pagination
    const lotteryDraws = await LotteryDraw.find(query)
      .sort({ draw_date: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // Get total count for pagination
    const total = await LotteryDraw.countDocuments(query);

    return successResponse(res, 'ดึงข้อมูลงวดหวยสำเร็จ', {
      lotteryDraws,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    }, 200);
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/member/lottery-draws/:id
// Get single lottery draw by ID
export const getLotteryDrawById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find lottery draw
    const lotteryDraw = await LotteryDraw.findById(id).lean();

    if (!lotteryDraw) {
      throw new AppError('ไม่พบข้อมูลงวดหวย', 404);
    }

    // Get lottery type label
    const lotteryType = await LotteryType.findOne({ value: lotteryDraw.lottery_type }).lean();
    if (lotteryType) {
      lotteryDraw.lottery_type_label = lotteryType.label;
    }

    return successResponse(res, 'ดึงข้อมูลงวดหวยสำเร็จ', {
      lotteryDraw
    }, 200);
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/member/lottery-draws/open
// Get all open lottery draws grouped by lottery type
export const getOpenLotteryDraws = async (req, res, next) => {
  try {
    // Get all enabled lottery types
    const lotteryTypes = await LotteryType.find({ enabled: true })
      .sort({ createdAt: 1 })
      .lean();

    // For each lottery type, get the latest open draw
    const results = await Promise.all(
      lotteryTypes.map(async (type) => {
        // Find the latest open draw for this lottery type
        const openDraw = await LotteryDraw.findOne({
          lottery_type: type.value,
          status: 'open'
        })
          .sort({ draw_date: -1, createdAt: -1 })
          .lean();

        return {
          lotteryType: type,
          draw: openDraw,
          hasOpenDraw: !!openDraw
        };
      })
    );

    return successResponse(res, 'ดึงข้อมูลงวดหวยที่เปิดรับแทงสำเร็จ', {
      results,
      total: results.length
    }, 200);
  } catch (error) {
    next(error);
  }
};
