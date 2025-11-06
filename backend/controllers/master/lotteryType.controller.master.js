import LotteryType from '../../models/lotteryType.model.js';
import AppError from '../../utils/AppError.js';
import { successResponse } from '../../utils/response.js';

// GET /api/v1/master/lottery-types
// Get all lottery types
export const getLotteryTypes = async (req, res, next) => {
  try {
    // Find all lottery types sorted by createdAt
    const lotteryTypes = await LotteryType.find().sort({ createdAt: 1 });

    return successResponse(res, 'ดึงข้อมูลประเภทหวยสำเร็จ', {
      lotteryTypes,
      total: lotteryTypes.length
    }, 200);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/master/lottery-types/:id/status
// Toggle lottery type status (enabled/disabled)
export const toggleLotteryTypeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;

    // Validate enabled field
    if (typeof enabled !== 'boolean') {
      throw new AppError('สถานะไม่ถูกต้อง (enabled ต้องเป็น boolean)', 400);
    }

    // Find lottery type
    const lotteryType = await LotteryType.findById(id);

    if (!lotteryType) {
      throw new AppError('ไม่พบประเภทหวย', 404);
    }

    // Update status
    lotteryType.enabled = enabled;
    await lotteryType.save();

    const statusText = enabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน';
    return successResponse(res, `${statusText}ประเภทหวยสำเร็จ`, {
      lotteryType
    }, 200);
  } catch (error) {
    next(error);
  }
};
