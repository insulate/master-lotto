import { body, validationResult } from 'express-validator';
import AppError from '../../utils/AppError.js';

/**
 * Validation middleware for authentication endpoints
 */

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    throw new AppError(errorMessages.join(', '), 400);
  }
  next();
};

/**
 * Validation rules for login
 */
export const validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('กรุณากรอก Username')
    .isLength({ min: 3 })
    .withMessage('Username ต้องมีอย่างน้อย 3 ตัวอักษร'),

  body('password')
    .notEmpty()
    .withMessage('กรุณากรอกรหัสผ่าน')
    .isLength({ min: 6 })
    .withMessage('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),

  handleValidationErrors
];

/**
 * Validation rules for change password
 */
export const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('กรุณากรอกรหัสผ่านปัจจุบัน'),

  body('newPassword')
    .notEmpty()
    .withMessage('กรุณากรอกรหัสผ่านใหม่')
    .isLength({ min: 6 })
    .withMessage('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม');
      }
      return true;
    }),

  handleValidationErrors
];

/**
 * Validation rules for refresh token
 */
export const validateRefreshToken = [
  body('refreshToken')
    .notEmpty()
    .withMessage('กรุณาส่ง refresh token'),

  handleValidationErrors
];

export default {
  validateLogin,
  validateChangePassword,
  validateRefreshToken,
  handleValidationErrors
};
