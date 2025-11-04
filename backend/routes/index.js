import express from 'express';
import authRoutes from './auth.routes.js';

const router = express.Router();

// API v1 Routes
router.use('/auth', authRoutes);

export default router;
