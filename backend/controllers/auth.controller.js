import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import AppError from '../utils/AppError.js';
import { successResponse } from '../utils/response.js';

// Generate JWT Access Token
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' }
  );
};

// Generate JWT Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username
    },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
  );
};

// POST /api/v1/auth/login
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      throw new AppError('Please provide username and password', 400);
    }

    // Find user from database
    const user = await User.findOne({ username });

    // Check if user exists
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if user is active
    if (user.status === 'suspended') {
      throw new AppError('Account is suspended', 403);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Note: Refresh tokens can be stored in database for better security
    // For now, we'll use stateless JWT

    return successResponse(res, 'Login successful', {
      user: user.toJSON(),
      accessToken,
      refreshToken
    }, 200);
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/logout
export const logout = async (req, res, next) => {
  try {
    // For stateless JWT, logout is handled client-side
    // If using refresh token storage, remove it here
    // const userId = req.user.id;
    // await removeRefreshToken(userId);

    return successResponse(res, 'Logout successful', null, 200);
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/auth/me
export const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get user from database
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return successResponse(res, 'User retrieved successfully', {
      user: user.toJSON()
    }, 200);
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/refresh
export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'
      );
    } catch (error) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // Get user from database
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if user is still active
    if (user.status === 'suspended') {
      throw new AppError('Account is suspended', 403);
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user);

    return successResponse(res, 'Token refreshed successfully', {
      accessToken: newAccessToken
    }, 200);
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/auth/change-password
export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError('Please provide current password and new password', 400);
    }

    // Validate new password length
    if (newPassword.length < 6) {
      throw new AppError('New password must be at least 6 characters long', 400);
    }

    // Get user from database
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    user.password = hashedPassword;
    await user.save();

    return successResponse(res, 'Password changed successfully', null, 200);
  } catch (error) {
    next(error);
  }
};
