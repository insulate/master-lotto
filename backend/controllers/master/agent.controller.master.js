import bcrypt from 'bcryptjs';
import User from '../../models/user.model.js';
import CreditTransaction from '../../models/creditTransaction.model.js';
import AppError from '../../utils/AppError.js';
import { successResponse } from '../../utils/response.js';

// GET /api/v1/master/agents
// Get all agents under current master
export const getAgents = async (req, res, next) => {
  try {
    const masterId = req.user.id;

    // Find all users where role is 'agent' and parent_id is current master
    const agents = await User.find({
      role: 'agent',
      parent_id: masterId
    }).select('-password').sort({ createdAt: -1 });

    return successResponse(res, 'ดึงข้อมูลเอเย่นต์สำเร็จ', {
      agents,
      total: agents.length
    }, 200);
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/master/agents/:id
// Get single agent by ID
export const getAgentById = async (req, res, next) => {
  try {
    const masterId = req.user.id;
    const { id } = req.params;

    // Find agent and verify it belongs to current master
    const agent = await User.findOne({
      _id: id,
      role: 'agent',
      parent_id: masterId
    }).select('-password');

    if (!agent) {
      throw new AppError('ไม่พบเอเย่นต์หรือไม่มีสิทธิ์เข้าถึง', 404);
    }

    return successResponse(res, 'ดึงข้อมูลเอเย่นต์สำเร็จ', {
      agent
    }, 200);
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/master/agents
// Create new agent
export const createAgent = async (req, res, next) => {
  try {
    const masterId = req.user.id;
    const { username, name, password, credit, commission_rates } = req.body;

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

    // Get master's data to verify credit
    const master = await User.findById(masterId);
    if (!master) {
      throw new AppError('ไม่พบข้อมูลผู้ใช้', 404);
    }

    // Validate credit amount
    const agentCredit = Number(credit) || 0;
    if (agentCredit < 0) {
      throw new AppError('เครดิตไม่สามารถเป็นค่าลบได้', 400);
    }

    // Master doesn't need credit check - can give unlimited credit to agents

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new agent
    const agent = await User.create({
      username,
      name,
      password: hashedPassword,
      role: 'agent',
      parent_id: masterId,
      credit: agentCredit,
      balance: 0,
      commission_rates: commission_rates || [],
      status: 'active'
    });

    // Master credit is not affected - master has unlimited credit

    return successResponse(res, 'สร้างเอเย่นต์สำเร็จ', {
      agent
    }, 201);
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/master/agents/:id
// Update agent information
export const updateAgent = async (req, res, next) => {
  try {
    const masterId = req.user.id;
    const { id } = req.params;
    const { name, commission_rates } = req.body;

    // Find agent and verify it belongs to current master
    const agent = await User.findOne({
      _id: id,
      role: 'agent',
      parent_id: masterId
    });

    if (!agent) {
      throw new AppError('ไม่พบเอเย่นต์หรือไม่มีสิทธิ์เข้าถึง', 404);
    }

    // Update fields if provided
    if (name) agent.name = name;
    if (commission_rates !== undefined) agent.commission_rates = commission_rates;

    await agent.save();

    return successResponse(res, 'อัพเดทข้อมูลเอเย่นต์สำเร็จ', {
      agent
    }, 200);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/master/agents/:id/status
// Toggle agent status (active/suspended)
export const toggleAgentStatus = async (req, res, next) => {
  try {
    const masterId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!status || !['active', 'suspended'].includes(status)) {
      throw new AppError('สถานะไม่ถูกต้อง (active หรือ suspended)', 400);
    }

    // Find agent and verify it belongs to current master
    const agent = await User.findOne({
      _id: id,
      role: 'agent',
      parent_id: masterId
    });

    if (!agent) {
      throw new AppError('ไม่พบเอเย่นต์หรือไม่มีสิทธิ์เข้าถึง', 404);
    }

    // Update status
    agent.status = status;
    await agent.save();

    const statusText = status === 'active' ? 'เปิดใช้งาน' : 'ระงับการใช้งาน';
    return successResponse(res, `${statusText}เอเย่นต์สำเร็จ`, {
      agent
    }, 200);
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/master/agents/:id/credit-history
// Get credit transaction history for specific agent
export const getAgentCreditHistory = async (req, res, next) => {
  try {
    const masterId = req.user.id;
    const { id } = req.params;

    // Verify agent belongs to current master
    const agent = await User.findOne({
      _id: id,
      role: 'agent',
      parent_id: masterId
    });

    if (!agent) {
      throw new AppError('ไม่พบเอเย่นต์หรือไม่มีสิทธิ์เข้าถึง', 404);
    }

    // Get transaction history for this agent
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

// PATCH /api/v1/master/agents/:id/credit
// Adjust agent credit (add or deduct)
export const adjustAgentCredit = async (req, res, next) => {
  try {
    const masterId = req.user.id;
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

    // Find agent and verify it belongs to current master
    const agent = await User.findOne({
      _id: id,
      role: 'agent',
      parent_id: masterId
    });

    if (!agent) {
      throw new AppError('ไม่พบเอเย่นต์หรือไม่มีสิทธิ์เข้าถึง', 404);
    }

    // Get master data
    const master = await User.findById(masterId);
    if (!master) {
      throw new AppError('ไม่พบข้อมูลผู้ใช้', 404);
    }

    // Store balance before transaction
    const balanceBefore = agent.credit;
    let balanceAfter;

    if (action === 'add') {
      // Master doesn't need credit check - can give unlimited credit to agents
      agent.credit += creditAmount;
      balanceAfter = agent.credit;
    } else if (action === 'deduct') {
      // Check if agent has enough credit
      if (agent.credit < creditAmount) {
        throw new AppError('เครดิตของเอเย่นต์ไม่เพียงพอ', 400);
      }

      // Deduct credit from agent (master credit is not affected)
      agent.credit -= creditAmount;
      balanceAfter = agent.credit;
    }

    await agent.save();
    // Master credit is not affected - no need to save master

    // Save transaction history
    await CreditTransaction.create({
      performed_by: masterId,
      agent_id: id,
      action: action,
      amount: creditAmount,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      note: req.body.note || ''
    });

    const actionText = action === 'add' ? 'เพิ่ม' : 'ลด';
    return successResponse(res, `${actionText}เครดิตเอเย่นต์สำเร็จ`, {
      agent,
      masterCredit: master.credit
    }, 200);
  } catch (error) {
    next(error);
  }
};
