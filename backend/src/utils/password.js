/**
 * Password Utilities
 * 
 * Secure password hashing and validation
 */

const bcrypt = require('bcryptjs')

const SALT_ROUNDS = 10

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string')
  }

  return await bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if password matches
 */
async function comparePassword(password, hash) {
  if (!password || !hash) {
    return false
  }

  return await bcrypt.compare(password, hash)
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
function validatePasswordStrength(password) {
  const errors = []

  if (!password || password.length < 6) {
    errors.push('كلمة المرور يجب أن تكون على الأقل 6 أحرف')
  }

  if (password.length > 128) {
    errors.push('كلمة المرور طويلة جداً')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

module.exports = {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
  SALT_ROUNDS,
}
