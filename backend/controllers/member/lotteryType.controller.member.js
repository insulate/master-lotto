import LotteryType from '../../models/lotteryType.model.js';
import { successResponse } from '../../utils/response.js';

// GET /api/v1/member/lottery-types
// Get all enabled lottery types for members
export const getLotteryTypes = async (req, res, next) => {
  try {
    // Find only enabled lottery types sorted by createdAt
    const lotteryTypes = await LotteryType.find({ enabled: true }).sort({ createdAt: 1 });

    return successResponse(res, 'ดึงข้อมูลประเภทหวยสำเร็จ', {
      lotteryTypes,
      total: lotteryTypes.length
    }, 200);
  } catch (error) {
    next(error);
  }
};
