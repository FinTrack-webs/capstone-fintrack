const logger = require('../utils/logger');

/**
 * Global Error Handler Middleware
 * Menangkap semua error yang diteruskan via next(err)
 */
const errorHandler = (err, req, res, next) => {
  logger.error(`${err.message}`, {
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  // Joi Validation Error
  if (err.isJoi) {
    return res.status(400).json({
      status: 'error',
      message: 'Validasi gagal',
      errors: err.details.map((d) => d.message),
    });
  }

  // Custom error dengan status code
  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : 'Terjadi kesalahan pada server';

  return res.status(statusCode).json({
    status: 'error',
    message,
  });
};

module.exports = errorHandler;
