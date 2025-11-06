import LotteryType from '../../models/lotteryType.model.js';
import { successResponse } from '../../utils/response.js';

// GET /api/v1/agent/lottery-types
// Get all lottery types (read-only for agents)
export const getLotteryTypes = async (req, res, next) => {
  try {
    const lotteryTypes = await LotteryType.find().sort({ createdAt: -1 });

    return successResponse(res, 'ดึงข้อมูลประเภทหวยสำเร็จ', {
      lotteryTypes,
      total: lotteryTypes.length
    }, 200);
  } catch (error) {
    next(error);
  }
};
