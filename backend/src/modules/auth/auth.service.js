/**
 * Authentication — JWT access + refresh with rotation.
 * Supports: login, refresh, logout, forgot-password, change-password, custom permissions.
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/prisma');
const config = require('../../config/env');
const { AuthError } = require('../../utils/errors');
const { permissionsForUser } = require('../../shared/permissions');

const REFRESH_DAYS = 7;

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function signAccessToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      customPermissions: user.customPermissions || [],
      mustChangePassword: user.mustChangePassword || false,
      type: 'access',
    },
    config.jwt.accessSecret,
    {
      expiresIn: config.jwt.accessExpiresIn,
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { userId: user.id, type: 'refresh', jti: crypto.randomUUID() },
    config.jwt.refreshSecret,
    {
      expiresIn: config.jwt.refreshExpiresIn,
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    }
  );
}

function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret, {
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    });
    if (decoded.type !== 'access') {
      throw new AuthError('Invalid token type', 401, 'INVALID_TOKEN');
    }
    return decoded;
  } catch (error) {
    if (error instanceof AuthError) throw error;
    if (error.name === 'TokenExpiredError') {
      throw new AuthError('Access token expired', 401, 'TOKEN_EXPIRED');
    }
    throw new AuthError('Invalid access token', 401, 'INVALID_TOKEN');
  }
}

function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret, {
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    });
    if (decoded.type !== 'refresh') {
      throw new AuthError('Invalid refresh token', 401, 'INVALID_REFRESH');
    }
    return decoded;
  } catch (error) {
    if (error instanceof AuthError) throw error;
    throw new AuthError('Invalid or expired refresh token', 401, 'INVALID_REFRESH');
  }
}

async function storeRefreshToken(userId, refreshToken) {
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({
    data: { userId, tokenHash, expiresAt },
  });
  return expiresAt;
}

async function revokeRefreshTokenHash(tokenHash) {
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    nameAr: user.nameAr,
    email: user.email,
    role: user.role,
    preferredLocale: user.preferredLocale,
    assignedGovernorate: user.assignedGovernorate,
    assignedDistrict: user.assignedDistrict,
    customPermissions: user.customPermissions || [],
    mustChangePassword: user.mustChangePassword || false,
    passwordResetRequest: user.passwordResetRequest || false,
    lastLoginAt: user.lastLoginAt,
    active: user.active,
    permissions: permissionsForUser({
      role: user.role,
      customPermissions: user.customPermissions || [],
    }),
  };
}

async function issueTokenPair(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await storeRefreshToken(user.id, refreshToken);
  return {
    accessToken,
    refreshToken,
    expiresIn: config.jwt.accessExpiresIn,
    user: sanitizeUser(user),
  };
}

async function login(email, password) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user || !user.active) {
    throw new AuthError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AuthError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // Update lastLoginAt
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return issueTokenPair(user);
}

async function refresh(refreshToken) {
  const decoded = verifyRefreshToken(refreshToken);
  const tokenHash = hashToken(refreshToken);

  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw new AuthError('Refresh token revoked or expired', 401, 'INVALID_REFRESH');
  }
  if (stored.userId !== decoded.userId) {
    throw new AuthError('Refresh token mismatch', 401, 'INVALID_REFRESH');
  }

  await revokeRefreshTokenHash(tokenHash);

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user || !user.active) {
    throw new AuthError('User inactive', 401, 'USER_INACTIVE');
  }

  return issueTokenPair(user);
}

async function logout(refreshToken) {
  if (!refreshToken) return;
  const tokenHash = hashToken(refreshToken);
  await revokeRefreshTokenHash(tokenHash);
}

async function getUserById(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.active) {
    throw new AuthError('User not found', 401, 'USER_NOT_FOUND');
  }
  return sanitizeUser(user);
}

/**
 * Record a password reset request from the user.
 * Always returns successfully (prevents email enumeration).
 */
async function forgotPassword(email) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { id: true, active: true },
  });

  if (!user || !user.active) {
    // Return silently — no enumeration
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetRequest: true,
      passwordResetAt: new Date(),
    },
  });

  // Audit log
  try {
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_RESET_REQUEST',
        entity: 'User',
        entityId: user.id,
      },
    });
  } catch {
    // Non-blocking
  }
}

/**
 * Change password for authenticated user.
 * Invalidates all refresh tokens on success.
 */
async function changePassword(userId, currentPassword, newPassword) {
  if (newPassword.length < 8) {
    throw new AuthError('كلمة المرور يجب أن تكون 8 أحرف على الأقل', 400, 'WEAK_PASSWORD');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AuthError('User not found', 404, 'USER_NOT_FOUND');

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    throw new AuthError('كلمة المرور الحالية غير صحيحة', 400, 'WRONG_PASSWORD');
  }

  const same = await bcrypt.compare(newPassword, user.passwordHash);
  if (same) {
    throw new AuthError('كلمة المرور الجديدة يجب أن تختلف', 400, 'SAME_PASSWORD');
  }

  const hash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hash, mustChangePassword: false },
  });

  // Invalidate all refresh tokens
  await prisma.refreshToken.deleteMany({ where: { userId } });

  // Audit log
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'PASSWORD_CHANGED',
        entity: 'User',
        entityId: userId,
      },
    });
  } catch {
    // Non-blocking
  }
}

module.exports = {
  login,
  refresh,
  logout,
  getUserById,
  forgotPassword,
  changePassword,
  verifyAccessToken,
  verifyToken: verifyAccessToken,
  hashToken,
};
