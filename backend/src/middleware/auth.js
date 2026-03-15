/**
 * Authentication Middleware
 * 
 * Verifies JWT tokens and attaches user to request object
 * Optimized: Permissions are embedded in token, no database query needed
 */

const { verifyToken } = require('../modules/auth/auth.service')
const { AuthError } = require('../utils/errors')
const { getArabicMessage } = require('../utils/arabicMessages')

/**
 * Development mode: Mock user with all permissions when no token
 */
const DEV_PERMISSIONS = [
  'CREATE_FAMILY', 'UPDATE_FAMILY', 'DELETE_FAMILY',
  'VIEW_SCORING', 'APPROVE_MEDICAL', 'VIEW_AUDIT_LOG'
]

/**
 * Require authentication middleware
 * Verifies JWT token and attaches user to req.user
 * In development: allows access without token (mock user)
 */
async function requireAuth(req, res, next) {
  try {
    // Development bypass: allow access without token
    if (process.env.NODE_ENV === 'development' && (!process.env.REQUIRE_AUTH || process.env.REQUIRE_AUTH === 'false')) {
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        req.user = {
          userId: 'dev-user',
          email: 'dev@charityhub.local',
          role: 'Admin',
          permissions: DEV_PERMISSIONS,
        }
        return next()
      }
    }

    // Extract token from Authorization header
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthError(
        getArabicMessage('AUTH_REQUIRED'),
        401,
        'AUTH_REQUIRED'
      )
    }

    // Extract token
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    if (!token) {
      throw new AuthError(
        getArabicMessage('AUTH_REQUIRED'),
        401,
        'AUTH_REQUIRED'
      )
    }

    // Verify and decode token (no database query)
    const decoded = verifyToken(token)

    // Attach user from token payload to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions || [],
    }

    next()
  } catch (error) {
    // If it's already an AppError, pass it through
    if (error.isOperational) {
      return next(error)
    }

    // Otherwise, create a generic auth error
    return next(
      new AuthError(
        getArabicMessage('AUTH_INVALID_TOKEN'),
        401,
        'AUTH_ERROR'
      )
    )
  }
}

/**
 * Optional authentication middleware
 * Attaches user if token is present, but doesn't fail if missing
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next() // Continue without user
    }

    const token = authHeader.substring(7)

    try {
      const { verifyToken } = require('../modules/auth/auth.service')
      const decoded = verifyToken(token)
      
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        permissions: decoded.permissions || [],
      }
    } catch (error) {
      // Silently fail for optional auth
      console.debug('Optional auth failed:', error.message)
    }

    next()
  } catch (error) {
    // Continue without user on any error
    next()
  }
}

module.exports = {
  requireAuth,
  optionalAuth,
}
