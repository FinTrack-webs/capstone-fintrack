/**
 * Async Handler Wrapper
 * Menangkap error dari async route handler dan meneruskan ke error handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
