import express from 'express';
import authRoutes from './auth.routes.js';
import agentRoutesMaster from './master/agent.routes.master.js';

const router = express.Router();

// API v1 Routes
router.use('/auth', authRoutes);
router.use('/master/agents', agentRoutesMaster);

export default router;
