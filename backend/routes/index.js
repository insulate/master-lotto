import express from 'express';
import authRoutes from './auth.routes.js';
import agentRoutesMaster from './master/agent.routes.master.js';
import lotteryDrawRoutesMaster from './master/lotteryDraw.routes.master.js';

const router = express.Router();

// API v1 Routes
router.use('/auth', authRoutes);
router.use('/master/agents', agentRoutesMaster);
router.use('/master/lottery-draws', lotteryDrawRoutesMaster);

export default router;
