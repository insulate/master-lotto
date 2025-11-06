import express from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import {
  getLotteryDraws,
  getOpenLotteryDraws
} from '../../controllers/member/lotteryDraw.controller.member.js';

const router = express.Router();

// All routes require authentication and member role
router.use(authenticate);
router.use(authorize('member'));

/**
 * @route   GET /api/v1/member/lottery-draws/open
 * @desc    Get all open lottery draws for members
 * @access  Private (Member only)
 */
router.get('/open', getOpenLotteryDraws);

/**
 * @route   GET /api/v1/member/lottery-draws
 * @desc    Get lottery draws with filters
 * @access  Private (Member only)
 */
router.get('/', getLotteryDraws);

export default router;
