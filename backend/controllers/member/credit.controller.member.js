import { successResponse } from '../../utils/response.js';
import CreditTransaction from '../../models/creditTransaction.model.js';

/**
 * Controller สำหรับจัดการประวัติเครดิตของ Member
 */

// GET /api/v1/member/credit-history
// Get member's own credit transaction history
export const getMyCreditHistory = async (req, res, next) => {
  try {
    const memberId = req.user._id;

    // Get transaction history for this member
    const transactions = await CreditTransaction.find({
      downline_id: memberId
    })
      .populate('performed_by', 'name username role')
      .sort({ createdAt: -1 }); // Sort by newest first

    return successResponse(res, 'ดึงประวัติเครดิตสำเร็จ', {
      transactions,
      total: transactions.length
    }, 200);
  } catch (error) {
    next(error);
  }
};
