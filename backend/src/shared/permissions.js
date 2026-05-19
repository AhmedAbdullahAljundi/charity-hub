/**
 * Role-based permission matrix (Phase 3).
 */

const { UserRole } = require('./constants/enums');

const PERMISSIONS = Object.freeze({
  HOUSEHOLD_READ: 'household:read',
  HOUSEHOLD_WRITE: 'household:write',
  HOUSEHOLD_DELETE: 'household:delete',
  HOUSEHOLD_PUBLISH: 'household:publish',
  INCOME_WRITE: 'income:write',
  INCOME_VERIFY: 'income:verify',
  SCORE_CALCULATE: 'score:calculate',
  SCORE_DECIDE: 'score:decide',
  SCORE_READ: 'score:read',
  SIMULATE: 'score:simulate',
  RULES_READ: 'rules:read',
  RULES_WRITE: 'rules:write',
  ANALYTICS_READ: 'analytics:read',
  AUDIT_READ: 'audit:read',
  VERIFICATION_READ: 'verification:read',
  VERIFICATION_BULK: 'verification:bulk',
});

const ROLE_PERMISSIONS = Object.freeze({
  [UserRole.ADMIN]: Object.values(PERMISSIONS),
  [UserRole.SUPERVISOR]: [
    PERMISSIONS.HOUSEHOLD_READ,
    PERMISSIONS.HOUSEHOLD_WRITE,
    PERMISSIONS.HOUSEHOLD_PUBLISH,
    PERMISSIONS.INCOME_WRITE,
    PERMISSIONS.INCOME_VERIFY,
    PERMISSIONS.SCORE_CALCULATE,
    PERMISSIONS.SCORE_DECIDE,
    PERMISSIONS.SCORE_READ,
    PERMISSIONS.SIMULATE,
    PERMISSIONS.RULES_READ,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.VERIFICATION_READ,
    PERMISSIONS.VERIFICATION_BULK,
  ],
  [UserRole.WORKER]: [
    PERMISSIONS.HOUSEHOLD_READ,
    PERMISSIONS.HOUSEHOLD_WRITE,
    PERMISSIONS.HOUSEHOLD_PUBLISH,
    PERMISSIONS.INCOME_WRITE,
    PERMISSIONS.SCORE_CALCULATE,
    PERMISSIONS.SCORE_READ,
    PERMISSIONS.SIMULATE,
    PERMISSIONS.VERIFICATION_READ,
  ],
  [UserRole.VIEWER]: [
    PERMISSIONS.HOUSEHOLD_READ,
    PERMISSIONS.SCORE_READ,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.VERIFICATION_READ,
  ],
});

function permissionsForRole(role) {
  return ROLE_PERMISSIONS[role] || [];
}

function hasPermission(user, permission) {
  if (!user?.role) return false;
  const perms = user.permissions || permissionsForRole(user.role);
  return perms.includes(permission) || perms.includes('*');
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new (require('../utils/errors').AuthError)('Authentication required'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new (require('../utils/errors').ForbiddenError)('Insufficient role'));
    }
    return next();
  };
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!hasPermission(req.user, permission)) {
      return next(new (require('../utils/errors').ForbiddenError)('Insufficient permissions'));
    }
    return next();
  };
}

module.exports = {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  permissionsForRole,
  hasPermission,
  requireRoles,
  requirePermission,
};
