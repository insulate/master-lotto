import express from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import {
  getAgents,
  getAgentById,
  createAgent,
  updateAgent,
  toggleAgentStatus,
  adjustAgentCredit,
  getAgentCreditHistory
} from '../../controllers/master/agent.controller.master.js';

const router = express.Router();

// All routes require authentication and master role
router.use(authenticate);
router.use(authorize('master'));

/**
 * @route   GET /api/v1/master/agents
 * @desc    Get all agents under current master
 * @access  Private (Master only)
 */
router.get('/', getAgents);

/**
 * @route   GET /api/v1/master/agents/:id
 * @desc    Get single agent by ID
 * @access  Private (Master only)
 */
router.get('/:id', getAgentById);

/**
 * @route   POST /api/v1/master/agents
 * @desc    Create new agent
 * @access  Private (Master only)
 */
router.post('/', createAgent);

/**
 * @route   PUT /api/v1/master/agents/:id
 * @desc    Update agent information (name, commission_rate)
 * @access  Private (Master only)
 */
router.put('/:id', updateAgent);

/**
 * @route   PATCH /api/v1/master/agents/:id/status
 * @desc    Toggle agent status (active/suspended)
 * @access  Private (Master only)
 */
router.patch('/:id/status', toggleAgentStatus);

/**
 * @route   GET /api/v1/master/agents/:id/credit-history
 * @desc    Get credit transaction history for specific agent
 * @access  Private (Master only)
 */
router.get('/:id/credit-history', getAgentCreditHistory);

/**
 * @route   PATCH /api/v1/master/agents/:id/credit
 * @desc    Adjust agent credit (add or deduct)
 * @access  Private (Master only)
 */
router.patch('/:id/credit', adjustAgentCredit);

export default router;
