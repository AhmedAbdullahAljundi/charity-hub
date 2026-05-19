const { verifyAccessToken } = require('../modules/auth/auth.service');
const { AuthError } = require('../utils/errors');
const { permissionsForRole } = require('../shared/permissions');
const config = require('../config/env');

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      if (
        config.app.env === 'development' &&
        !config.auth.requireAuth
      ) {
        req.user = {
          userId: 'dev-admin',
          email: 'admin@system.local',
          role: 'ADMIN',
          permissions: permissionsForRole('ADMIN'),
        };
        return next();
      }
      throw new AuthError('Authentication required', 401, 'AUTH_REQUIRED');
    }

    const token = authHeader.slice(7);
    const decoded = verifyAccessToken(token);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      permissions: permissionsForRole(decoded.role),
    };
    next();
  } catch (error) {
    next(error.isOperational ? error : new AuthError('Invalid token', 401));
  }
}

/** Attach user from Bearer token when present (for rate limiting / logging). */
function optionalAttachUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }
  try {
    const token = authHeader.slice(7);
    const decoded = verifyAccessToken(token);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      permissions: permissionsForRole(decoded.role),
    };
  } catch {
    // Unauthenticated for optional attach — route guards still enforce auth
  }
  next();
}

module.exports = { requireAuth, optionalAttachUser };
