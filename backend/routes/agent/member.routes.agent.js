import express from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  toggleMemberStatus,
  adjustMemberCredit,
  getMemberCreditHistory
} from '../../controllers/agent/member.controller.agent.js';

const router = express.Router();

// All routes require authentication and agent role
router.use(authenticate);
router.use(authorize('agent'));

/**
 * @route   GET /api/v1/agent/members
 * @desc    Get all members under current agent
 * @access  Private (Agent only)
 */
router.get('/', getMembers);

/**
 * @route   GET /api/v1/agent/members/:id
 * @desc    Get single member by ID
 * @access  Private (Agent only)
 */
router.get('/:id', getMemberById);

/**
 * @route   POST /api/v1/agent/members
 * @desc    Create new member
 * @access  Private (Agent only)
 */
router.post('/', createMember);

/**
 * @route   PUT /api/v1/agent/members/:id
 * @desc    Update member information (name, commission_rate)
 * @access  Private (Agent only)
 */
router.put('/:id', updateMember);

/**
 * @route   PATCH /api/v1/agent/members/:id/status
 * @desc    Toggle member status (active/suspended)
 * @access  Private (Agent only)
 */
router.patch('/:id/status', toggleMemberStatus);

/**
 * @route   GET /api/v1/agent/members/:id/credit-history
 * @desc    Get credit transaction history for specific member
 * @access  Private (Agent only)
 */
router.get('/:id/credit-history', getMemberCreditHistory);

/**
 * @route   PATCH /api/v1/agent/members/:id/credit
 * @desc    Adjust member credit (add or deduct)
 * @access  Private (Agent only)
 */
router.patch('/:id/credit', adjustMemberCredit);

export default router;
