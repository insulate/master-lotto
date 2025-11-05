import LotteryDraw from '../../models/lotteryDraw.model.js';
import AppError from '../../utils/AppError.js';
import { successResponse } from '../../utils/response.js';

// GET /api/v1/master/lottery-draws
// Get all lottery draws with filters
export const getLotteryDraws = async (req, res, next) => {
  try {
    const masterId = req.user.id;
    const { lottery_type, status, start_date, end_date, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { created_by: masterId };

    if (lottery_type) {
      query.lottery_type = lottery_type;
    }

    if (status) {
      query.status = status;
    }

    if (start_date || end_date) {
      query.draw_date = {};
      if (start_date) {
        query.draw_date.$gte = new Date(start_date);
      }
      if (end_date) {
        query.draw_date.$lte = new Date(end_date);
      }
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await LotteryDraw.countDocuments(query);

    // Execute query
    const lotteryDraws = await LotteryDraw.find(query)
      .sort({ draw_date: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('created_by', 'name username');

    return successResponse(
      res,
      'ดึงข้อมูลงวดหวยสำเร็จ',
      {
        lotteryDraws,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
      200
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/master/lottery-draws/:id
// Get single lottery draw by ID
export const getLotteryDrawById = async (req, res, next) => {
  try {
    const masterId = req.user.id;
    const { id } = req.params;

    const lotteryDraw = await LotteryDraw.findOne({
      _id: id,
      created_by: masterId,
    }).populate('created_by', 'name username');

    if (!lotteryDraw) {
      throw new AppError('ไม่พบงวดหวยหรือไม่มีสิทธิ์เข้าถึง', 404);
    }

    return successResponse(res, 'ดึงข้อมูลงวดหวยสำเร็จ', { lotteryDraw }, 200);
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/master/lottery-draws
// Create new lottery draw
export const createLotteryDraw = async (req, res, next) => {
  try {
    const masterId = req.user.id;
    const { lottery_type, draw_date, open_time, close_time, bet_settings } = req.body;

    // Validate required fields
    if (!lottery_type || !draw_date || !open_time || !close_time) {
      throw new AppError('กรุณากรอกข้อมูลให้ครบถ้วน', 400);
    }

    // Validate lottery_type
    const validTypes = ['government', 'lao_pattana', 'hanoi_regular', 'hanoi_vip'];
    if (!validTypes.includes(lottery_type)) {
      throw new AppError('ประเภทหวยไม่ถูกต้อง', 400);
    }

    // Validate dates
    const openDate = new Date(open_time);
    const closeDate = new Date(close_time);
    const drawDate = new Date(draw_date);

    if (openDate >= closeDate) {
      throw new AppError('เวลาเปิดรับแทงต้องอยู่ก่อนเวลาปิดรับแทง', 400);
    }

    if (closeDate >= drawDate) {
      throw new AppError('เวลาปิดรับแทงต้องอยู่ก่อนวันที่ออกผล', 400);
    }

    // Create lottery draw
    const lotteryDraw = await LotteryDraw.create({
      lottery_type,
      draw_date: drawDate,
      open_time: openDate,
      close_time: closeDate,
      bet_settings: bet_settings || {}, // Use provided bet_settings or defaults from model
      created_by: masterId,
      status: 'open',
    });

    return successResponse(res, 'สร้างงวดหวยสำเร็จ', { lotteryDraw }, 201);
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/master/lottery-draws/:id
// Update lottery draw information
export const updateLotteryDraw = async (req, res, next) => {
  try {
    const masterId = req.user.id;
    const { id } = req.params;
    const { draw_date, open_time, close_time, bet_settings } = req.body;

    // Find lottery draw
    const lotteryDraw = await LotteryDraw.findOne({
      _id: id,
      created_by: masterId,
    });

    if (!lotteryDraw) {
      throw new AppError('ไม่พบงวดหวยหรือไม่มีสิทธิ์เข้าถึง', 404);
    }

    // Can only update if status is 'open'
    if (lotteryDraw.status !== 'open') {
      throw new AppError('สามารถแก้ไขได้เฉพาะงวดที่เปิดรับแทงเท่านั้น', 400);
    }

    // Update fields if provided
    if (draw_date) {
      lotteryDraw.draw_date = new Date(draw_date);
    }

    if (open_time) {
      lotteryDraw.open_time = new Date(open_time);
    }

    if (close_time) {
      lotteryDraw.close_time = new Date(close_time);
    }

    if (bet_settings) {
      lotteryDraw.bet_settings = {
        ...lotteryDraw.bet_settings,
        ...bet_settings,
      };
    }

    // Validate dates
    if (lotteryDraw.open_time >= lotteryDraw.close_time) {
      throw new AppError('เวลาเปิดรับแทงต้องอยู่ก่อนเวลาปิดรับแทง', 400);
    }

    if (lotteryDraw.close_time >= lotteryDraw.draw_date) {
      throw new AppError('เวลาปิดรับแทงต้องอยู่ก่อนวันที่ออกผล', 400);
    }

    await lotteryDraw.save();

    return successResponse(res, 'อัพเดทงวดหวยสำเร็จ', { lotteryDraw }, 200);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/master/lottery-draws/:id/status
// Update lottery draw status
export const updateDrawStatus = async (req, res, next) => {
  try {
    const masterId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['open', 'closed', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      throw new AppError('สถานะไม่ถูกต้อง', 400);
    }

    // Find lottery draw
    const lotteryDraw = await LotteryDraw.findOne({
      _id: id,
      created_by: masterId,
    });

    if (!lotteryDraw) {
      throw new AppError('ไม่พบงวดหวยหรือไม่มีสิทธิ์เข้าถึง', 404);
    }

    // Validate status transitions
    const currentStatus = lotteryDraw.status;

    // Can always cancel
    if (status === 'cancelled') {
      lotteryDraw.status = status;
    } else if (currentStatus === 'open' && status === 'closed') {
      // Open -> Closed: OK
      lotteryDraw.status = status;
    } else if (currentStatus === 'closed' && status === 'completed') {
      // Closed -> Completed: OK
      lotteryDraw.status = status;
    } else {
      throw new AppError(`ไม่สามารถเปลี่ยนสถานะจาก ${currentStatus} เป็น ${status} ได้`, 400);
    }

    await lotteryDraw.save();

    const statusText = {
      open: 'เปิดรับแทง',
      closed: 'ปิดรับแทง',
      completed: 'ประกาศผล',
      cancelled: 'ยกเลิก',
    };

    return successResponse(
      res,
      `เปลี่ยนสถานะเป็น${statusText[status]}สำเร็จ`,
      { lotteryDraw },
      200
    );
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/master/lottery-draws/:id/result
// Update lottery draw result
export const updateDrawResult = async (req, res, next) => {
  try {
    const masterId = req.user.id;
    const { id } = req.params;
    const { result } = req.body;

    if (!result) {
      throw new AppError('กรุณาระบุผลรางวัล', 400);
    }

    // Find lottery draw
    const lotteryDraw = await LotteryDraw.findOne({
      _id: id,
      created_by: masterId,
    });

    if (!lotteryDraw) {
      throw new AppError('ไม่พบงวดหวยหรือไม่มีสิทธิ์เข้าถึง', 404);
    }

    // Can only set result if status is 'closed'
    if (lotteryDraw.status !== 'closed') {
      throw new AppError('สามารถใส่ผลได้เฉพาะงวดที่ปิดรับแทงแล้วเท่านั้น', 400);
    }

    // Update result
    lotteryDraw.result = {
      ...lotteryDraw.result,
      ...result,
    };

    // Auto set status to 'completed'
    lotteryDraw.status = 'completed';

    await lotteryDraw.save();

    return successResponse(res, 'ประกาศผลรางวัลสำเร็จ', { lotteryDraw }, 200);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/master/lottery-draws/:id
// Delete lottery draw
export const deleteLotteryDraw = async (req, res, next) => {
  try {
    const masterId = req.user.id;
    const { id } = req.params;

    // Find lottery draw
    const lotteryDraw = await LotteryDraw.findOne({
      _id: id,
      created_by: masterId,
    });

    if (!lotteryDraw) {
      throw new AppError('ไม่พบงวดหวยหรือไม่มีสิทธิ์เข้าถึง', 404);
    }

    // Can only delete if status is 'open' or 'cancelled'
    if (!['open', 'cancelled'].includes(lotteryDraw.status)) {
      throw new AppError('สามารถลบได้เฉพาะงวดที่เปิดรับแทงหรือยกเลิกแล้วเท่านั้น', 400);
    }

    // TODO: Check if there are any bets placed (will implement in future)
    // For now, allow deletion

    await LotteryDraw.deleteOne({ _id: id });

    return successResponse(res, 'ลบงวดหวยสำเร็จ', null, 200);
  } catch (error) {
    next(error);
  }
};
