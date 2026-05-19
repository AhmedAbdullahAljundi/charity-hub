const crypto = require('crypto');

function traceIdMiddleware(req, res, next) {
  req.traceId = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('x-request-id', req.traceId);
  next();
}

module.exports = { traceIdMiddleware };
