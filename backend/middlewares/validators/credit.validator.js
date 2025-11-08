import { body, validationResult } from 'express-validator';
import AppError from '../../utils/AppError.js';

/**
 * Validation middleware for credit management endpoints
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
 * Validation rules for credit adjustment
 */
export const validateCreditAdjustment = [
  body('amount')
    .notEmpty()
    .withMessage('กรุณาระบุจำนวนเครดิต')
    .isNumeric()
    .withMessage('จำนวนเครดิตต้องเป็นตัวเลข')
    .custom((value) => {
      const numValue = Number(value);
      if (numValue <= 0) {
        throw new Error('จำนวนเครดิตต้องมากกว่า 0');
      }
      return true;
    }),

  body('action')
    .notEmpty()
    .withMessage('กรุณาระบุประเภทการทำรายการ')
    .isIn(['add', 'deduct'])
    .withMessage('ประเภทการทำรายการต้องเป็น add หรือ deduct'),

  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('หมายเหตุต้องไม่เกิน 500 ตัวอักษร'),

  handleValidationErrors
];

export default {
  validateCreditAdjustment,
  handleValidationErrors
};
