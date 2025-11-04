/**
 * Standard API Response Helper
 * ใช้สำหรับสร้าง response ที่เป็นมาตรฐานเดียวกันทั้งระบบ
 */

/**
 * Success Response
 * @param {Object} res - Express response object
 * @param {String} message - Success message
 * @param {Object} data - Response data
 * @param {Number} statusCode - HTTP status code (default: 200)
 */
export const successResponse = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Error Response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Array} errors - Array of error details
 * @param {Number} statusCode - HTTP status code (default: 400)
 */
export const errorResponse = (res, message, errors = [], statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    errors
  });
};

/**
 * Validation Error Response
 * @param {Object} res - Express response object
 * @param {Array} errors - Array of validation errors
 */
export const validationErrorResponse = (res, errors = []) => {
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    data: null,
    errors
  });
};

/**
 * Unauthorized Response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
export const unauthorizedResponse = (res, message = 'Unauthorized') => {
  return res.status(401).json({
    success: false,
    message,
    data: null,
    errors: []
  });
};

/**
 * Forbidden Response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
export const forbiddenResponse = (res, message = 'Forbidden') => {
  return res.status(403).json({
    success: false,
    message,
    data: null,
    errors: []
  });
};

/**
 * Not Found Response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
export const notFoundResponse = (res, message = 'Not found') => {
  return res.status(404).json({
    success: false,
    message,
    data: null,
    errors: []
  });
};

/**
 * Server Error Response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
export const serverErrorResponse = (res, message = 'Internal server error') => {
  return res.status(500).json({
    success: false,
    message,
    data: null,
    errors: []
  });
};
