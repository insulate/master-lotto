import { body, validationResult } from 'express-validator';
import AppError from '../../utils/AppError.js';

/**
 * Validation middleware for user management endpoints
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
 * Validation rules for creating agent
 */
export const validateCreateAgent = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('กรุณากรอก Username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username ต้องมี 3-50 ตัวอักษร')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username ต้องประกอบด้วยตัวอักษร ตัวเลข และ _ เท่านั้น'),

  body('password')
    .notEmpty()
    .withMessage('กรุณากรอกรหัสผ่าน')
    .isLength({ min: 6 })
    .withMessage('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),

  body('name')
    .trim()
    .notEmpty()
    .withMessage('กรุณากรอกชื่อ')
    .isLength({ max: 100 })
    .withMessage('ชื่อต้องไม่เกิน 100 ตัวอักษร'),

  body('contact')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('ข้อมูลติดต่อต้องไม่เกิน 200 ตัวอักษร'),

  handleValidationErrors
];

/**
 * Validation rules for creating member
 */
export const validateCreateMember = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('กรุณากรอก Username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username ต้องมี 3-50 ตัวอักษร')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username ต้องประกอบด้วยตัวอักษร ตัวเลข และ _ เท่านั้น'),

  body('password')
    .notEmpty()
    .withMessage('กรุณากรอกรหัสผ่าน')
    .isLength({ min: 6 })
    .withMessage('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),

  body('name')
    .trim()
    .notEmpty()
    .withMessage('กรุณากรอกชื่อ')
    .isLength({ max: 100 })
    .withMessage('ชื่อต้องไม่เกิน 100 ตัวอักษร'),

  body('contact')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('ข้อมูลติดต่อต้องไม่เกิน 200 ตัวอักษร'),

  handleValidationErrors
];

/**
 * Validation rules for updating user profile
 */
export const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('ชื่อต้องไม่เป็นค่าว่าง')
    .isLength({ max: 100 })
    .withMessage('ชื่อต้องไม่เกิน 100 ตัวอักษร'),

  body('contact')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('ข้อมูลติดต่อต้องไม่เกิน 200 ตัวอักษร'),

  handleValidationErrors
];

export default {
  validateCreateAgent,
  validateCreateMember,
  validateUpdateProfile,
  handleValidationErrors
};
