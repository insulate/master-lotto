import express from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { getLotteryTypes } from '../../controllers/agent/lotteryType.controller.agent.js';

const router = express.Router();

// All routes require authentication and agent role
router.use(authenticate);
router.use(authorize('agent'));

// GET /api/v1/agent/lottery-types - Get all lottery types
router.get('/', getLotteryTypes);

export default router;
