import express from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import {
  getLotteryDraws,
  getLotteryDrawById,
  createLotteryDraw,
  updateLotteryDraw,
  updateDrawStatus,
  updateDrawResult,
  deleteLotteryDraw,
  bulkCreateLotteryDraws,
} from '../../controllers/master/lotteryDraw.controller.master.js';

const router = express.Router();

// All routes require authentication and master role
router.use(authenticate);
router.use(authorize('master'));

/**
 * @route   GET /api/v1/master/lottery-draws
 * @desc    Get all lottery draws with filters
 * @access  Private (Master only)
 * @query   lottery_type, status, start_date, end_date, page, limit
 */
router.get('/', getLotteryDraws);

/**
 * @route   GET /api/v1/master/lottery-draws/:id
 * @desc    Get single lottery draw by ID
 * @access  Private (Master only)
 */
router.get('/:id', getLotteryDrawById);

/**
 * @route   POST /api/v1/master/lottery-draws/bulk-create
 * @desc    Create multiple lottery draws at once
 * @access  Private (Master only)
 */
router.post('/bulk-create', bulkCreateLotteryDraws);

/**
 * @route   POST /api/v1/master/lottery-draws
 * @desc    Create new lottery draw
 * @access  Private (Master only)
 */
router.post('/', createLotteryDraw);

/**
 * @route   PUT /api/v1/master/lottery-draws/:id
 * @desc    Update lottery draw information
 * @access  Private (Master only)
 */
router.put('/:id', updateLotteryDraw);

/**
 * @route   PATCH /api/v1/master/lottery-draws/:id/status
 * @desc    Update lottery draw status
 * @access  Private (Master only)
 */
router.patch('/:id/status', updateDrawStatus);

/**
 * @route   PATCH /api/v1/master/lottery-draws/:id/result
 * @desc    Update lottery draw result
 * @access  Private (Master only)
 */
router.patch('/:id/result', updateDrawResult);

/**
 * @route   DELETE /api/v1/master/lottery-draws/:id
 * @desc    Delete lottery draw
 * @access  Private (Master only)
 */
router.delete('/:id', deleteLotteryDraw);

export default router;
