/**
 * Authentication Service
 * 
 * Business logic for authentication
 */

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../../config/prisma')
const config = require('../../config/env')
const { AppError, AuthError } = require('../../utils/errors')
const { getUserWithPermissions } = require('../../services/rbac/rbacService')

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password) {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if password matches
 */
async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash)
}

/**
 * Generate JWT token with user data and permissions
 * @param {Object} user - User object with role and permissions
 * @returns {string} JWT token
 */
function generateToken(user) {
  const payload = {
    userId: user.id,
    role: user.role.name,
    permissions: user.permissions,
    email: user.email,
  }

  const options = {
    expiresIn: '24h',
    issuer: 'charityhub',
    audience: 'charityhub-users',
  }

  return jwt.sign(payload, config.jwt.secret, options)
}

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, config.jwt.secret, {
      issuer: 'charityhub',
      audience: 'charityhub-users',
    })
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AuthError('انتهت صلاحية رمز الدخول', 401, 'TOKEN_EXPIRED')
    } else if (error.name === 'JsonWebTokenError') {
      throw new AuthError('رمز الدخول غير صالح', 401, 'INVALID_TOKEN')
    } else {
      throw new AuthError('فشل التحقق من رمز الدخول', 401, 'TOKEN_VERIFICATION_FAILED')
    }
  }
}

/**
 * Authenticate user and generate token
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User data and token
 */
async function login(email, password) {
  // Find user with role and permissions
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  })

  if (!user) {
    throw new AuthError('البريد الإلكتروني أو كلمة المرور غير صحيحة', 401, 'INVALID_CREDENTIALS')
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password)

  if (!isPasswordValid) {
    throw new AuthError('البريد الإلكتروني أو كلمة المرور غير صحيحة', 401, 'INVALID_CREDENTIALS')
  }

  // Get user with permissions
  const userWithPermissions = await getUserWithPermissions(user.id)

  // Generate token with permissions embedded
  const token = generateToken(userWithPermissions)

  // Update last login (optional)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      // Add lastLoginAt field if exists in schema
    },
  })

  // Return user data (without password) and token
  const { password: _, ...userWithoutPassword } = user

  return {
    user: {
      id: userWithoutPassword.id,
      name: userWithoutPassword.name,
      email: userWithoutPassword.email,
      role: {
        id: user.role.id,
        name: user.role.name,
      },
      permissions: userWithPermissions.permissions,
    },
    token,
  }
}

/**
 * Get user by ID (for token verification)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User object with permissions
 */
async function getUserById(userId) {
  const user = await getUserWithPermissions(userId)

  if (!user) {
    throw new AuthError('المستخدم غير موجود', 401, 'USER_NOT_FOUND')
  }

  return user
}

module.exports = {
  login,
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  getUserById,
}
