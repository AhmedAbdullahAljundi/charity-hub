/**
 * 404 Not Found Handler
 */

const { getArabicMessage } = require('../utils/arabicMessages')

function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    code: 'NOT_FOUND',
    message: getArabicMessage('NOT_FOUND'),
    path: req.originalUrl,
  })
}

module.exports = { notFoundHandler }
