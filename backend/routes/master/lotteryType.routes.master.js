import express from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import {
  getLotteryTypes,
  toggleLotteryTypeStatus
} from '../../controllers/master/lotteryType.controller.master.js';

const router = express.Router();

// All routes require authentication and master role
router.use(authenticate);
router.use(authorize('master'));

/**
 * @route   GET /api/v1/master/lottery-types
 * @desc    Get all lottery types
 * @access  Private (Master only)
 */
router.get('/', getLotteryTypes);

/**
 * @route   PATCH /api/v1/master/lottery-types/:id/status
 * @desc    Toggle lottery type status (enabled/disabled)
 * @access  Private (Master only)
 */
router.patch('/:id/status', toggleLotteryTypeStatus);

export default router;
