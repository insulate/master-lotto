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

    // Execute query - Sort by draw_date ascending (nearest date first)
    const lotteryDraws = await LotteryDraw.find(query)
      .sort({ draw_date: 1, createdAt: 1 })
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

// POST /api/v1/master/lottery-draws/bulk-create
// Create multiple lottery draws at once
export const bulkCreateLotteryDraws = async (req, res, next) => {
  try {
    const masterId = req.user.id;
    const {
      lottery_types,  // Array of lottery types to create
      days_ahead,     // Number of days to create ahead
      frequency,      // 'daily', 'weekly', 'custom', or 'monthly'
      custom_days,    // Array of day numbers (0-6, where 0 = Sunday) for weekly frequency
      monthly_dates,  // Array of date numbers (1-31) for monthly frequency
      open_time_offset, // Minutes before draw_date to open betting (e.g., -1440 = 24 hours before)
      close_time_offset, // Minutes before draw_date to close betting (e.g., -30 = 30 minutes before)
      draw_time,      // Time of day for draw (HH:MM format, e.g., "16:30")
      bet_settings    // Default bet settings for all draws
    } = req.body;

    // Validate required fields
    if (!lottery_types || !Array.isArray(lottery_types) || lottery_types.length === 0) {
      throw new AppError('กรุณาเลือกประเภทหวยอย่างน้อย 1 ประเภท', 400);
    }

    if (!days_ahead || days_ahead < 1 || days_ahead > 365) {
      throw new AppError('กรุณาระบุจำนวนวันที่ถูกต้อง (1-365 วัน)', 400);
    }

    if (!frequency || !['daily', 'weekly', 'custom', 'monthly'].includes(frequency)) {
      throw new AppError('กรุณาระบุความถี่ที่ถูกต้อง (daily, weekly, custom, monthly)', 400);
    }

    if (frequency === 'custom' && (!custom_days || !Array.isArray(custom_days) || custom_days.length === 0)) {
      throw new AppError('กรุณาเลือกวันในสัปดาห์สำหรับการสร้างแบบกำหนดเอง', 400);
    }

    if (frequency === 'monthly' && (!monthly_dates || !Array.isArray(monthly_dates) || monthly_dates.length === 0)) {
      throw new AppError('กรุณาเลือกวันที่ในเดือนสำหรับการสร้างแบบรายเดือน', 400);
    }

    if (!draw_time || !/^\d{2}:\d{2}$/.test(draw_time)) {
      throw new AppError('กรุณาระบุเวลาออกผลในรูปแบบ HH:MM', 400);
    }

    // Validate lottery types
    const validTypes = ['government', 'lao_pattana', 'hanoi_regular', 'hanoi_vip'];
    const invalidTypes = lottery_types.filter(type => !validTypes.includes(type));
    if (invalidTypes.length > 0) {
      throw new AppError(`ประเภทหวยไม่ถูกต้อง: ${invalidTypes.join(', ')}`, 400);
    }

    // Parse draw time
    const [drawHours, drawMinutes] = draw_time.split(':').map(Number);

    // Generate dates based on frequency
    const dates = [];
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0); // Reset to start of day

    for (let i = 1; i <= days_ahead; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
      const dayOfMonth = currentDate.getDate(); // 1-31

      // Check if this date should be included based on frequency
      let includeDate = false;

      if (frequency === 'daily') {
        includeDate = true;
      } else if (frequency === 'weekly') {
        // For weekly, create on the same day of week as today
        includeDate = dayOfWeek === startDate.getDay();
      } else if (frequency === 'custom') {
        // For custom, check if current day is in custom_days array
        includeDate = custom_days.includes(dayOfWeek);
      } else if (frequency === 'monthly') {
        // For monthly, check if current date is in monthly_dates array
        includeDate = monthly_dates.includes(dayOfMonth);
      }

      if (includeDate) {
        dates.push(new Date(currentDate));
      }
    }

    if (dates.length === 0) {
      throw new AppError('ไม่มีวันที่ตรงกับเงื่อนไขที่กำหนด', 400);
    }

    // Create lottery draws for each lottery type and date
    const createdDraws = [];
    const errors = [];

    for (const lottery_type of lottery_types) {
      for (const date of dates) {
        try {
          // Set draw date with specified time (using local Bangkok timezone)
          const draw_date = new Date(date);
          draw_date.setHours(drawHours, drawMinutes, 0, 0);

          // Calculate open and close times
          const open_time = new Date(draw_date);
          open_time.setMinutes(open_time.getMinutes() + (open_time_offset || -1440)); // Default: 24 hours before

          const close_time = new Date(draw_date);
          close_time.setMinutes(close_time.getMinutes() + (close_time_offset || -30)); // Default: 30 minutes before

          // Validate times
          if (open_time >= close_time) {
            errors.push({
              lottery_type,
              date: draw_date.toISOString(),
              error: 'เวลาเปิดรับแทงต้องอยู่ก่อนเวลาปิดรับแทง'
            });
            continue;
          }

          if (close_time >= draw_date) {
            errors.push({
              lottery_type,
              date: draw_date.toISOString(),
              error: 'เวลาปิดรับแทงต้องอยู่ก่อนวันที่ออกผล'
            });
            continue;
          }

          // Check if draw already exists for this type and date
          const existingDraw = await LotteryDraw.findOne({
            lottery_type,
            draw_date: {
              $gte: new Date(draw_date.getFullYear(), draw_date.getMonth(), draw_date.getDate()),
              $lt: new Date(draw_date.getFullYear(), draw_date.getMonth(), draw_date.getDate() + 1)
            },
            created_by: masterId
          });

          if (existingDraw) {
            errors.push({
              lottery_type,
              date: draw_date.toISOString(),
              error: 'มีงวดหวยในวันนี้อยู่แล้ว'
            });
            continue;
          }

          // Create the draw
          const lotteryDraw = await LotteryDraw.create({
            lottery_type,
            draw_date,
            open_time,
            close_time,
            bet_settings: bet_settings || {},
            created_by: masterId,
            status: 'open',
          });

          createdDraws.push(lotteryDraw);
        } catch (error) {
          errors.push({
            lottery_type,
            date: date.toISOString(),
            error: error.message
          });
        }
      }
    }

    return successResponse(
      res,
      `สร้างงวดหวยสำเร็จ ${createdDraws.length} งวด`,
      {
        created: createdDraws.length,
        lotteryDraws: createdDraws,
        errors: errors.length > 0 ? errors : undefined
      },
      201
    );
  } catch (error) {
    next(error);
  }
};
