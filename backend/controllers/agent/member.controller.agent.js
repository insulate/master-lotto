import bcrypt from 'bcryptjs';
import User from '../../models/user.model.js';
import CreditTransaction from '../../models/creditTransaction.model.js';
import AppError from '../../utils/AppError.js';
import { successResponse } from '../../utils/response.js';

// GET /api/v1/agent/members
// Get all members under current agent
export const getMembers = async (req, res, next) => {
  try {
    const agentId = req.user.id;

    // Find all users where role is 'member' and parent_id is current agent
    const members = await User.find({
      role: 'member',
      parent_id: agentId
    }).select('-password').sort({ createdAt: -1 });

    return successResponse(res, 'ดึงข้อมูลผู้เล่นสำเร็จ', {
      members,
      total: members.length
    }, 200);
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/agent/members/:id
// Get single member by ID
export const getMemberById = async (req, res, next) => {
  try {
    const agentId = req.user.id;
    const { id } = req.params;

    // Find member and verify it belongs to current agent
    const member = await User.findOne({
      _id: id,
      role: 'member',
      parent_id: agentId
    }).select('-password');

    if (!member) {
      throw new AppError('ไม่พบผู้เล่นหรือไม่มีสิทธิ์เข้าถึง', 404);
    }

    return successResponse(res, 'ดึงข้อมูลผู้เล่นสำเร็จ', {
      member
    }, 200);
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/agent/members
// Create new member
export const createMember = async (req, res, next) => {
  try {
    const agentId = req.user.id;
    const { username, name, password, credit, commission_rates, contact } = req.body;

    // Validate required fields
    if (!username || !name || !password) {
      throw new AppError('กรุณากรอกข้อมูลให้ครบถ้วน', 400);
    }

    // Validate password length
    if (password.length < 6) {
      throw new AppError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', 400);
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw new AppError('ชื่อผู้ใช้นี้ถูกใช้งานแล้ว', 400);
    }

    // Get agent's data to verify credit
    const agent = await User.findById(agentId);
    if (!agent) {
      throw new AppError('ไม่พบข้อมูลผู้ใช้', 404);
    }

    // Validate credit amount
    const memberCredit = Number(credit) || 0;
    if (memberCredit < 0) {
      throw new AppError('เครดิตไม่สามารถเป็นค่าลบได้', 400);
    }

    // Agent needs to check credit before giving to member (unlike Master with unlimited credit)
    if (memberCredit > agent.credit) {
      throw new AppError('เครดิตของคุณไม่เพียงพอ', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new member
    const member = await User.create({
      username,
      name,
      password: hashedPassword,
      role: 'member',
      parent_id: agentId,
      credit: memberCredit,
      balance: 0,
      commission_rates: commission_rates || [],
      contact: contact || '',
      status: 'active'
    });

    // Deduct credit from agent
    agent.credit -= memberCredit;
    await agent.save();

    return successResponse(res, 'สร้างผู้เล่นสำเร็จ', {
      member,
      agentCredit: agent.credit
    }, 201);
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/agent/members/:id
// Update member information
export const updateMember = async (req, res, next) => {
  try {
    const agentId = req.user.id;
    const { id } = req.params;
    const { name, commission_rates, contact } = req.body;

    // Find member and verify it belongs to current agent
    const member = await User.findOne({
      _id: id,
      role: 'member',
      parent_id: agentId
    });

    if (!member) {
      throw new AppError('ไม่พบผู้เล่นหรือไม่มีสิทธิ์เข้าถึง', 404);
    }

    // Update fields if provided
    if (name) member.name = name;
    if (commission_rates !== undefined) member.commission_rates = commission_rates;
    if (contact !== undefined) member.contact = contact;

    await member.save();

    return successResponse(res, 'อัพเดทข้อมูลผู้เล่นสำเร็จ', {
      member
    }, 200);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/agent/members/:id/status
// Toggle member status (active/suspended)
export const toggleMemberStatus = async (req, res, next) => {
  try {
    const agentId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!status || !['active', 'suspended'].includes(status)) {
      throw new AppError('สถานะไม่ถูกต้อง (active หรือ suspended)', 400);
    }

    // Find member and verify it belongs to current agent
    const member = await User.findOne({
      _id: id,
      role: 'member',
      parent_id: agentId
    });

    if (!member) {
      throw new AppError('ไม่พบผู้เล่นหรือไม่มีสิทธิ์เข้าถึง', 404);
    }

    // Update status
    member.status = status;
    await member.save();

    const statusText = status === 'active' ? 'เปิดใช้งาน' : 'ระงับการใช้งาน';
    return successResponse(res, `${statusText}ผู้เล่นสำเร็จ`, {
      member
    }, 200);
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/agent/members/:id/credit-history
// Get credit transaction history for specific member
export const getMemberCreditHistory = async (req, res, next) => {
  try {
    const agentId = req.user.id;
    const { id } = req.params;

    // Verify member belongs to current agent
    const member = await User.findOne({
      _id: id,
      role: 'member',
      parent_id: agentId
    });

    if (!member) {
      throw new AppError('ไม่พบผู้เล่นหรือไม่มีสิทธิ์เข้าถึง', 404);
    }

    // Get transaction history for this member
    const transactions = await CreditTransaction.find({
      agent_id: id
    })
      .populate('performed_by', 'name username')
      .sort({ createdAt: -1 }); // Sort by newest first

    return successResponse(res, 'ดึงประวัติเครดิตสำเร็จ', {
      transactions,
      total: transactions.length
    }, 200);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/agent/members/:id/credit
// Adjust member credit (add or deduct)
export const adjustMemberCredit = async (req, res, next) => {
  try {
    const agentId = req.user.id;
    const { id } = req.params;
    const { amount, action } = req.body;

    // Validate input
    if (!amount || !action || !['add', 'deduct'].includes(action)) {
      throw new AppError('กรุณาระบุจำนวนเครดิตและประเภทการทำรายการ (add หรือ deduct)', 400);
    }

    const creditAmount = Number(amount);
    if (isNaN(creditAmount) || creditAmount <= 0) {
      throw new AppError('จำนวนเครดิตต้องเป็นตัวเลขที่มากกว่า 0', 400);
    }

    // Find member and verify it belongs to current agent
    const member = await User.findOne({
      _id: id,
      role: 'member',
      parent_id: agentId
    });

    if (!member) {
      throw new AppError('ไม่พบผู้เล่นหรือไม่มีสิทธิ์เข้าถึง', 404);
    }

    // Get agent data
    const agent = await User.findById(agentId);
    if (!agent) {
      throw new AppError('ไม่พบข้อมูลผู้ใช้', 404);
    }

    // Store balance before transaction
    const balanceBefore = member.credit;
    let balanceAfter;

    if (action === 'add') {
      // Agent needs to check credit before giving to member (unlike Master)
      if (agent.credit < creditAmount) {
        throw new AppError('เครดิตของคุณไม่เพียงพอ', 400);
      }

      // Add credit to member and deduct from agent
      member.credit += creditAmount;
      agent.credit -= creditAmount;
      balanceAfter = member.credit;
    } else if (action === 'deduct') {
      // Check if member has enough credit
      if (member.credit < creditAmount) {
        throw new AppError('เครดิตของผู้เล่นไม่เพียงพอ', 400);
      }

      // Deduct credit from member and return to agent
      member.credit -= creditAmount;
      agent.credit += creditAmount;
      balanceAfter = member.credit;
    }

    await member.save();
    await agent.save();

    // Save transaction history
    await CreditTransaction.create({
      performed_by: agentId,
      agent_id: id,
      action: action,
      amount: creditAmount,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      note: req.body.note || ''
    });

    const actionText = action === 'add' ? 'เพิ่ม' : 'ลด';
    return successResponse(res, `${actionText}เครดิตผู้เล่นสำเร็จ`, {
      member,
      agentCredit: agent.credit
    }, 200);
  } catch (error) {
    next(error);
  }
};
