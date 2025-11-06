import express from 'express';
import authRoutes from './auth.routes.js';
import agentRoutesMaster from './master/agent.routes.master.js';
import lotteryDrawRoutesMaster from './master/lotteryDraw.routes.master.js';
import lotteryTypeRoutesMaster from './master/lotteryType.routes.master.js';
import memberRoutesAgent from './agent/member.routes.agent.js';
import lotteryTypeRoutesAgent from './agent/lotteryType.routes.agent.js';
import lotteryTypeRoutesMember from './member/lotteryType.routes.member.js';
import lotteryDrawRoutesMember from './member/lotteryDraw.routes.member.js';

const router = express.Router();

// API v1 Routes
router.use('/auth', authRoutes);
router.use('/master/agents', agentRoutesMaster);
router.use('/master/lottery-draws', lotteryDrawRoutesMaster);
router.use('/master/lottery-types', lotteryTypeRoutesMaster);
router.use('/agent/members', memberRoutesAgent);
router.use('/agent/lottery-types', lotteryTypeRoutesAgent);
router.use('/member/lottery-types', lotteryTypeRoutesMember);
router.use('/member/lottery-draws', lotteryDrawRoutesMember);

export default router;
