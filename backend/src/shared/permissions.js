/**
 * Role-based permission matrix + custom permissions support.
 * customPermissions are ADDITIVE — they extend role permissions, never restrict.
 */

const { UserRole } = require('./constants/enums');

const PERMISSIONS = Object.freeze({
  // Households
  HOUSEHOLD_READ:    'household:read',
  HOUSEHOLD_WRITE:   'household:write',
  HOUSEHOLD_DELETE:  'household:delete',
  HOUSEHOLD_PUBLISH: 'household:publish',

  // Persons
  PERSON_WRITE:      'person:write',
  PERSON_DELETE:     'person:delete',

  // Income
  INCOME_WRITE:      'income:write',
  INCOME_VERIFY:     'income:verify',
  INCOME_DELETE:     'income:delete',

  // Burdens
  BURDEN_WRITE:      'burden:write',

  // Scoring
  SCORE_CALCULATE:   'score:calculate',
  SCORE_READ:        'score:read',
  SCORE_DECIDE:      'score:decide',
  SCORE_SIMULATE:    'score:simulate',

  // Legacy alias kept for backwards compat
  SIMULATE:          'score:simulate',

  // Rules (Admin only)
  RULES_READ:        'rules:read',
  RULES_WRITE:       'rules:write',

  // Analytics
  ANALYTICS_READ:    'analytics:read',

  // Audit
  AUDIT_READ:        'audit:read',

  // Verification
  VERIFICATION_READ:  'verification:read',
  VERIFICATION_WRITE: 'verification:write',
  VERIFICATION_BULK:  'verification:bulk',

  // Education
  EDUCATION_READ:   'education:read',
  EDUCATION_WRITE:  'education:write',
  EDUCATION_DELETE: 'education:delete',

  // Users management (Admin only)
  USER_READ:   'user:read',
  USER_WRITE:  'user:write',
  USER_DELETE: 'user:delete',
});

const ROLE_PERMISSIONS = Object.freeze({
  [UserRole.ADMIN]: Object.values(PERMISSIONS).filter(
    (v, i, a) => a.indexOf(v) === i // deduplicate (SIMULATE alias)
  ),
  [UserRole.SUPERVISOR]: [
    PERMISSIONS.HOUSEHOLD_READ,
    PERMISSIONS.HOUSEHOLD_WRITE,
    PERMISSIONS.HOUSEHOLD_PUBLISH,
    PERMISSIONS.PERSON_WRITE,
    PERMISSIONS.PERSON_DELETE,
    PERMISSIONS.INCOME_WRITE,
    PERMISSIONS.INCOME_VERIFY,
    PERMISSIONS.INCOME_DELETE,
    PERMISSIONS.BURDEN_WRITE,
    PERMISSIONS.SCORE_CALCULATE,
    PERMISSIONS.SCORE_READ,
    PERMISSIONS.SCORE_DECIDE,
    PERMISSIONS.SCORE_SIMULATE,
    PERMISSIONS.RULES_READ,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.VERIFICATION_READ,
    PERMISSIONS.VERIFICATION_WRITE,
    PERMISSIONS.VERIFICATION_BULK,
    PERMISSIONS.EDUCATION_READ,
    PERMISSIONS.EDUCATION_WRITE,
  ],
  [UserRole.WORKER]: [
    PERMISSIONS.HOUSEHOLD_READ,
    PERMISSIONS.HOUSEHOLD_WRITE,
    PERMISSIONS.HOUSEHOLD_PUBLISH,
    PERMISSIONS.PERSON_WRITE,
    PERMISSIONS.INCOME_WRITE,
    PERMISSIONS.BURDEN_WRITE,
    PERMISSIONS.SCORE_CALCULATE,
    PERMISSIONS.SCORE_READ,
    PERMISSIONS.SCORE_SIMULATE,
    PERMISSIONS.VERIFICATION_READ,
    PERMISSIONS.EDUCATION_READ,
    PERMISSIONS.EDUCATION_WRITE,
    PERMISSIONS.ANALYTICS_READ,
  ],
  [UserRole.VIEWER]: [
    PERMISSIONS.HOUSEHOLD_READ,
    PERMISSIONS.SCORE_READ,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.VERIFICATION_READ,
    PERMISSIONS.EDUCATION_READ,
  ],
});

/**
 * Get all permissions for a role (base permissions only).
 */
function permissionsForRole(role) {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Get effective permissions for a user:
 * role permissions UNION custom permissions (additive only).
 * customPermissions values must be valid PERMISSIONS values.
 */
function permissionsForUser(user) {
  const rolePerms = permissionsForRole(user.role);
  const custom = Array.isArray(user.customPermissions)
    ? user.customPermissions.filter((p) => Object.values(PERMISSIONS).includes(p))
    : [];
  // deduplicate
  return [...new Set([...rolePerms, ...custom])];
}

/**
 * Check if a user has a specific permission.
 * Checks role perms + custom perms + wildcard.
 */
function hasPermission(user, permission) {
  if (!user?.role) return false;
  const perms = permissionsForUser(user);
  return perms.includes(permission) || perms.includes('*');
}

/**
 * Express middleware: require specific role(s).
 */
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

/**
 * Express middleware: require specific permission.
 */
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
  permissionsForUser,
  hasPermission,
  requireRoles,
  requirePermission,
};
