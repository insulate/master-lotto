import express from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { getMyCreditHistory } from '../../controllers/member/credit.controller.member.js';

const router = express.Router();

// All routes require authentication and member role
router.use(authenticate);
router.use(authorize('member'));

/**
 * @route   GET /api/v1/member/credit-history
 * @desc    Get member's own credit transaction history
 * @access  Private (Member only)
 */
router.get('/', getMyCreditHistory);

export default router;
