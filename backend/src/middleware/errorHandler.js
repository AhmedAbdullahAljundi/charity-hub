/**
 * Centralized Error Handler
 * 
 * Handles all application errors
 */

const { getArabicMessage } = require('../utils/arabicMessages')

function errorHandler(err, req, res, next) {
  // Log error (suppress stack traces for expected operational errors like AuthError)
  if (err.code === 'AUTH_ERROR' || err.statusCode === 401) {
    console.warn(`[Auth] ${err.message || 'Unauthorized'}`);
  } else {
    console.error('Error:', err);
  }

  // Determine status code
  const statusCode = err.statusCode || err.status || 500
  const code = err.code || 'INTERNAL_ERROR'
  const message = err.message || getArabicMessage('INTERNAL_ERROR')
  const details = err.details || null

  // Send error response
  res.status(statusCode).json({
    success: false,
    code,
    message,
    details,
    traceId: req.traceId,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

module.exports = { errorHandler, asyncHandler }
