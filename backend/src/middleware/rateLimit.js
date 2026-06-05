const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, code: 'RATE_LIMIT', message: 'Too many login attempts' },
  keyGenerator: (req) => req.ip || req.socket.remoteAddress || 'unknown',
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, code: 'RATE_LIMIT', message: 'Too many reset requests' },
  keyGenerator: (req) => req.ip || req.socket.remoteAddress || 'unknown',
});

function userKeyGenerator(req) {
  if (req.user?.userId) return req.user.userId;
  return req.ip || 'anonymous';
}

const calculateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, code: 'RATE_LIMIT', message: 'Calculate rate limit exceeded' },
  keyGenerator: userKeyGenerator,
});

const getApiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, code: 'RATE_LIMIT', message: 'API rate limit exceeded' },
  keyGenerator: userKeyGenerator,
  skip: (req) => req.method !== 'GET',
});

module.exports = {
  loginLimiter,
  forgotPasswordLimiter,
  calculateLimiter,
  getApiLimiter,
};

