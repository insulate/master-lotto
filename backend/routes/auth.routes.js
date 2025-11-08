import express from 'express';
import {
  login,
  logout,
  getMe,
  refresh,
  changePassword
} from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  validateLogin,
  validateChangePassword,
  validateRefreshToken
} from '../middlewares/validators/auth.validator.js';

const router = express.Router();

// POST /api/v1/auth/login
router.post('/login', validateLogin, login);

// POST /api/v1/auth/logout (requires authentication)
router.post('/logout', authenticate, logout);

// GET /api/v1/auth/me (requires authentication)
router.get('/me', authenticate, getMe);

// POST /api/v1/auth/refresh
router.post('/refresh', validateRefreshToken, refresh);

// PUT /api/v1/auth/change-password (requires authentication)
router.put('/change-password', authenticate, validateChangePassword, changePassword);

export default router;
