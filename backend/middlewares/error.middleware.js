/**
 * Global Error Handler Middleware
 * จัดการ error ทั้งหมดในระบบ
 */

// Error Handler Middleware
export const errorHandler = (err, req, res, next) => {
  // Default values
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const errors = err.errors || [];

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    statusCode,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    errors
  });
};

// Not Found Handler
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};
