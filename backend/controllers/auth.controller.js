import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

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
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
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
    //   return res.status(401).json({
    //     success: false,
    //     message: 'Invalid credentials'
    //   });
    // }

    // Check if user is active
    if (mockUser.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Account is suspended'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, mockUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(mockUser);
    const refreshToken = generateRefreshToken(mockUser);

    // TODO: Save refresh token to database
    // await saveRefreshToken(mockUser.id, refreshToken);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: mockUser.toJSON(),
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// POST /api/v1/auth/logout
export const logout = async (req, res) => {
  try {
    const userId = req.user.id;

    // TODO: Remove refresh token from database
    // await removeRefreshToken(userId);

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
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

    res.json({
      success: true,
      data: {
        user: mockUser.toJSON()
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// POST /api/v1/auth/refresh
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'
      );
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    // TODO: Check if refresh token exists in database
    // const isValidToken = await checkRefreshToken(decoded.id, refreshToken);
    // if (!isValidToken) {
    //   return res.status(401).json({
    //     success: false,
    //     message: 'Invalid refresh token'
    //   });
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

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// PUT /api/v1/auth/change-password
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password'
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // TODO: Get user from database
    // const user = await findUserById(userId);

    // TODO: Verify current password
    // const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    // if (!isPasswordValid) {
    //   return res.status(401).json({
    //     success: false,
    //     message: 'Current password is incorrect'
    //   });
    // }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // TODO: Update password in database
    // await updateUserPassword(userId, hashedPassword);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
