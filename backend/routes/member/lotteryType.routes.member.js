import express from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { getLotteryTypes } from '../../controllers/member/lotteryType.controller.member.js';

const router = express.Router();

// All routes require authentication and member role
router.use(authenticate);
router.use(authorize('member'));

/**
 * @route   GET /api/v1/member/lottery-types
 * @desc    Get all enabled lottery types for members
 * @access  Private (Member only)
 */
router.get('/', getLotteryTypes);

export default router;
