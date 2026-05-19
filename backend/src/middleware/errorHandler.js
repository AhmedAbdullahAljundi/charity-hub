/**
 * Centralized Error Handler
 * 
 * Handles all application errors
 */

const { getArabicMessage } = require('../utils/arabicMessages')

function errorHandler(err, req, res, next) {
  // Log error
  console.error('Error:', err)

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

module.exports = { errorHandler }
