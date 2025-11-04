/**
 * Custom Application Error Class
 * ใช้สำหรับสร้าง error ที่มี statusCode และ errors
 */
class AppError extends Error {
  constructor(message, statusCode = 400, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
