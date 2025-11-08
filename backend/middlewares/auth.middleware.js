import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';

// Authenticate JWT Token
export const authenticate = (req, res, next) => {
  try {
    // Check if JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Add user info to request
      req.user = {
        _id: decoded.id,
        username: decoded.username,
        role: decoded.role
      };

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Token expired', 401);
      }

      throw new AppError('Invalid token', 401);
    }
  } catch (error) {
    next(error);
  }
};

// Authorize by role
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new AppError('Not authorized to access this resource', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
