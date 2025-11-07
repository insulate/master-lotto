import express from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import {
  placeBet,
  getBets,
  getBetById
} from '../../controllers/member/bet.controller.member.js';

const router = express.Router();

// All routes require authentication and member role
router.use(authenticate);
router.use(authorize('member'));

/**
 * @route   POST /api/v1/member/bets
 * @desc    Place a new bet
 * @access  Private (Member only)
 */
router.post('/', placeBet);

/**
 * @route   GET /api/v1/member/bets
 * @desc    Get member's bet history
 * @access  Private (Member only)
 */
router.get('/', getBets);

/**
 * @route   GET /api/v1/member/bets/:id
 * @desc    Get bet by ID
 * @access  Private (Member only)
 */
router.get('/:id', getBetById);

export default router;
