import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse
} from '../utils/response.js';

// Generate JWT Access Token
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '15m' } // Short-lived access token
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
    { expiresIn: '7d' } // Long-lived refresh token
  );
};

// POST /api/v1/auth/login
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return errorResponse(res, 'Please provide username and password', [], 400);
    }

    // TODO: Find user from database
    // const user = await findUserByUsername(username);

    // Mock user for demonstration
    const mockUser = new User({
      id: '123e4567-e89b-12d3-a456-426614174000',
      username: 'admin',
      name: 'Administrator',
      password: await bcrypt.hash('password', 10),
      role: 'master',
      status: 'active'
    });

    // Check if user exists
    // if (!user) {
    //   return unauthorizedResponse(res, 'Invalid credentials');
    // }

    // Check if user is active
    if (mockUser.status === 'suspended') {
      return forbiddenResponse(res, 'Account is suspended');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, mockUser.password);
    if (!isPasswordValid) {
      return unauthorizedResponse(res, 'Invalid credentials');
    }

    // Generate tokens
    const accessToken = generateAccessToken(mockUser);
    const refreshToken = generateRefreshToken(mockUser);

    // TODO: Save refresh token to database
    // await saveRefreshToken(mockUser.id, refreshToken);

    return successResponse(res, 'Login successful', {
      user: mockUser.toJSON(),
      accessToken,
      refreshToken
    }, 200);
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Server error', [], 500);
  }
};

// POST /api/v1/auth/logout
export const logout = async (req, res) => {
  try {
    const userId = req.user.id;

    // TODO: Remove refresh token from database
    // await removeRefreshToken(userId);

    return successResponse(res, 'Logout successful', null, 200);
  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse(res, 'Server error', [], 500);
  }
};

// GET /api/v1/auth/me
export const getMe = async (req, res) => {
  try {
    // req.user is set by authentication middleware
    const userId = req.user.id;

    // TODO: Get user from database
    // const user = await findUserById(userId);

    // Mock user
    const mockUser = new User({
      id: userId,
      username: req.user.username,
      name: 'User Name',
      role: req.user.role,
      status: 'active',
      credit: 1000,
      balance: 500
    });

    return successResponse(res, 'User retrieved successfully', {
      user: mockUser.toJSON()
    }, 200);
  } catch (error) {
    console.error('Get me error:', error);
    return errorResponse(res, 'Server error', [], 500);
  }
};

// POST /api/v1/auth/refresh
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, 'Refresh token is required', [], 400);
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'
      );
    } catch (error) {
      return unauthorizedResponse(res, 'Invalid or expired refresh token');
    }

    // TODO: Check if refresh token exists in database
    // const isValidToken = await checkRefreshToken(decoded.id, refreshToken);
    // if (!isValidToken) {
    //   return unauthorizedResponse(res, 'Invalid refresh token');
    // }

    // TODO: Get user from database
    // const user = await findUserById(decoded.id);

    // Mock user
    const mockUser = new User({
      id: decoded.id,
      username: decoded.username,
      name: 'User Name',
      role: 'master',
      status: 'active'
    });

    // Generate new access token
    const newAccessToken = generateAccessToken(mockUser);

    return successResponse(res, 'Token refreshed successfully', {
      accessToken: newAccessToken
    }, 200);
  } catch (error) {
    console.error('Refresh token error:', error);
    return errorResponse(res, 'Server error', [], 500);
  }
};

// PUT /api/v1/auth/change-password
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Please provide current password and new password', [], 400);
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return errorResponse(res, 'New password must be at least 6 characters long', [], 400);
    }

    // TODO: Get user from database
    // const user = await findUserById(userId);

    // TODO: Verify current password
    // const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    // if (!isPasswordValid) {
    //   return unauthorizedResponse(res, 'Current password is incorrect');
    // }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // TODO: Update password in database
    // await updateUserPassword(userId, hashedPassword);

    return successResponse(res, 'Password changed successfully', null, 200);
  } catch (error) {
    console.error('Change password error:', error);
    return errorResponse(res, 'Server error', [], 500);
  }
};
