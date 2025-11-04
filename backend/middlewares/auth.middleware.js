import jwt from 'jsonwebtoken';
import {
  unauthorizedResponse,
  forbiddenResponse,
  errorResponse
} from '../utils/response.js';

// Authenticate JWT Token
export const authenticate = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorizedResponse(res, 'No token provided');
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

      // Add user info to request
      req.user = {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role
      };

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return unauthorizedResponse(res, 'Token expired');
      }

      return unauthorizedResponse(res, 'Invalid token');
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return errorResponse(res, 'Server error', [], 500);
  }
};

// Authorize by role
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return unauthorizedResponse(res, 'Not authenticated');
      }

      if (!allowedRoles.includes(req.user.role)) {
        return forbiddenResponse(res, 'Not authorized to access this resource');
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return errorResponse(res, 'Server error', [], 500);
    }
  };
};
