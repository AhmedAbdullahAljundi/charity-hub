/**
 * Role-Based Access Control (RBAC) Middleware
 * 
 * Checks user permissions and roles for route access
 * Optimized: Uses permissions from token payload, no database query
 */

const { ForbiddenError } = require('../utils/errors')
const { getArabicMessage } = require('../utils/arabicMessages')

/**
 * Require specific permission
 * @param {string} permissionName - Permission name to check
 * @returns {Function} Express middleware
 * 
 * Optimized: Checks permissions from token payload, no database query
 */
function requirePermission(permissionName) {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user || !req.user.userId) {
        return next(
          new ForbiddenError(
            getArabicMessage('AUTH_REQUIRED'),
            401
          )
        )
      }

      // Check permission from token payload (no database query)
      const userPermissions = req.user.permissions || []

      if (!userPermissions.includes(permissionName)) {
        return next(
          new ForbiddenError(
            getArabicMessage('PERMISSION_DENIED'),
            403,
            'PERMISSION_DENIED',
            { requiredPermission: permissionName }
          )
        )
      }

      next()
    } catch (error) {
      if (error.isOperational) {
        return next(error)
      }

      return next(
        new ForbiddenError(
          getArabicMessage('FORBIDDEN_ACCESS'),
          403
        )
      )
    }
  }
}

/**
 * Require any of the specified permissions
 * @param {Array<string>} permissionNames - Array of permission names
 * @returns {Function} Express middleware
 * 
 * Optimized: Checks permissions from token payload, no database query
 */
function requireAnyPermission(permissionNames) {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.userId) {
        return next(
          new ForbiddenError(
            getArabicMessage('AUTH_REQUIRED'),
            401
          )
        )
      }

      // Check permissions from token payload
      const userPermissions = req.user.permissions || []
      const hasPermission = permissionNames.some((perm) => userPermissions.includes(perm))

      if (!hasPermission) {
        return next(
          new ForbiddenError(
            getArabicMessage('PERMISSION_DENIED'),
            403,
            'PERMISSION_DENIED',
            { requiredPermissions: permissionNames }
          )
        )
      }

      next()
    } catch (error) {
      if (error.isOperational) {
        return next(error)
      }

      return next(
        new ForbiddenError(
          getArabicMessage('FORBIDDEN_ACCESS'),
          403
        )
      )
    }
  }
}

/**
 * Require all specified permissions
 * @param {Array<string>} permissionNames - Array of permission names
 * @returns {Function} Express middleware
 * 
 * Optimized: Checks permissions from token payload, no database query
 */
function requireAllPermissions(permissionNames) {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.userId) {
        return next(
          new ForbiddenError(
            getArabicMessage('AUTH_REQUIRED'),
            401
          )
        )
      }

      // Check permissions from token payload
      const userPermissions = req.user.permissions || []
      const hasAllPermissions = permissionNames.every((perm) => userPermissions.includes(perm))

      if (!hasAllPermissions) {
        return next(
          new ForbiddenError(
            getArabicMessage('PERMISSION_DENIED'),
            403,
            'PERMISSION_DENIED',
            { requiredPermissions: permissionNames }
          )
        )
      }

      next()
    } catch (error) {
      if (error.isOperational) {
        return next(error)
      }

      return next(
        new ForbiddenError(
          getArabicMessage('FORBIDDEN_ACCESS'),
          403
        )
      )
    }
  }
}

/**
 * Require specific role
 * @param {string} roleName - Role name to check
 * @returns {Function} Express middleware
 * 
 * Optimized: Checks role from token payload, no database query
 */
function requireRole(roleName) {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.userId) {
        return next(
          new ForbiddenError(
            getArabicMessage('AUTH_REQUIRED'),
            401
          )
        )
      }

      // Check role from token payload
      if (req.user.role !== roleName) {
        return next(
          new ForbiddenError(
            getArabicMessage('FORBIDDEN_ACCESS'),
            403,
            'ROLE_DENIED',
            { requiredRole: roleName }
          )
        )
      }

      next()
    } catch (error) {
      if (error.isOperational) {
        return next(error)
      }

      return next(
        new ForbiddenError(
          getArabicMessage('FORBIDDEN_ACCESS'),
          403
        )
      )
    }
  }
}

/**
 * Require any of the specified roles
 * @param {Array<string>} roleNames - Array of role names
 * @returns {Function} Express middleware
 * 
 * Optimized: Checks role from token payload, no database query
 */
function requireAnyRole(roleNames) {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.userId) {
        return next(
          new ForbiddenError(
            getArabicMessage('AUTH_REQUIRED'),
            401
          )
        )
      }

      // Check role from token payload
      if (!roleNames.includes(req.user.role)) {
        return next(
          new ForbiddenError(
            getArabicMessage('FORBIDDEN_ACCESS'),
            403,
            'ROLE_DENIED',
            { requiredRoles: roleNames }
          )
        )
      }

      next()
    } catch (error) {
      if (error.isOperational) {
        return next(error)
      }

      return next(
        new ForbiddenError(
          getArabicMessage('FORBIDDEN_ACCESS'),
          403
        )
      )
    }
  }
}

/**
 * Require admin role (convenience function)
 * @returns {Function} Express middleware
 */
function requireAdmin() {
  return requireRole('Admin')
}

module.exports = {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireRole,
  requireAnyRole,
  requireAdmin,
}
