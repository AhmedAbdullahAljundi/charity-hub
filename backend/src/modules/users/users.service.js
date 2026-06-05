/**
 * Users Service — CRUD, role management, custom permissions, password reset.
 */

const bcrypt = require('bcryptjs');
const prisma = require('../../config/prisma');
const { PERMISSIONS, permissionsForUser } = require('../../shared/permissions');

const VALID_ROLES = ['ADMIN', 'SUPERVISOR', 'WORKER', 'VIEWER'];
const VALID_PERMISSIONS = Object.values(PERMISSIONS).filter(
  (v, i, a) => a.indexOf(v) === i
);

function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  const effectivePermissions = permissionsForUser({
    role: user.role,
    customPermissions: user.customPermissions || [],
  });
  return {
    ...safe,
    effectivePermissions,
  };
}

async function listUsers({ page = 1, limit = 20, search = '', role = '' } = {}) {
  const skip = (page - 1) * limit;
  const where = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(role && { role }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        nameAr: true,
        email: true,
        role: true,
        active: true,
        preferredLocale: true,
        customPermissions: true,
        mustChangePassword: true,
        passwordResetRequest: true,
        passwordResetAt: true,
        lastLoginAt: true,
        assignedGovernorate: true,
        assignedDistrict: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users: users.map((u) => ({
      ...u,
      effectivePermissions: permissionsForUser({
        role: u.role,
        customPermissions: u.customPermissions || [],
      }),
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      nameAr: true,
      email: true,
      role: true,
      active: true,
      preferredLocale: true,
      customPermissions: true,
      mustChangePassword: true,
      passwordResetRequest: true,
      passwordResetAt: true,
      lastLoginAt: true,
      assignedGovernorate: true,
      assignedDistrict: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) throw { status: 404, message: 'المستخدم غير موجود' };
  return {
    ...user,
    effectivePermissions: permissionsForUser({
      role: user.role,
      customPermissions: user.customPermissions || [],
    }),
  };
}

async function createUser({ name, email, password, role, governorate, district, preferredLocale }) {
  if (!VALID_ROLES.includes(role)) {
    throw { status: 400, message: 'دور غير صالح', code: 'INVALID_ROLE' };
  }
  if (!password || password.length < 8) {
    throw { status: 400, message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل', code: 'WEAK_PASSWORD' };
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (existing) {
    throw { status: 409, message: 'البريد الإلكتروني مستخدم بالفعل', code: 'EMAIL_TAKEN' };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      assignedGovernorate: governorate || null,
      assignedDistrict: district || null,
      preferredLocale: preferredLocale || 'AR',
    },
    select: {
      id: true, name: true, email: true, role: true, active: true,
      preferredLocale: true, customPermissions: true, createdAt: true,
    },
  });

  return {
    ...user,
    effectivePermissions: permissionsForUser({ role: user.role, customPermissions: [] }),
  };
}

async function updateUser(id, data) {
  const { name, nameAr, role, active, governorate, district, preferredLocale } = data;

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (nameAr !== undefined) updateData.nameAr = nameAr;
  if (role !== undefined) {
    if (!VALID_ROLES.includes(role)) throw { status: 400, message: 'دور غير صالح' };
    updateData.role = role;
  }
  if (active !== undefined) updateData.active = active;
  if (governorate !== undefined) updateData.assignedGovernorate = governorate;
  if (district !== undefined) updateData.assignedDistrict = district;
  if (preferredLocale !== undefined) updateData.preferredLocale = preferredLocale;

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true, name: true, email: true, role: true, active: true,
      preferredLocale: true, customPermissions: true, createdAt: true, updatedAt: true,
    },
  });

  return {
    ...user,
    effectivePermissions: permissionsForUser({
      role: user.role,
      customPermissions: user.customPermissions || [],
    }),
  };
}

async function softDeleteUser(id) {
  await prisma.user.update({
    where: { id },
    data: { active: false },
  });
}

async function changeRole(id, role, adminId) {
  if (!VALID_ROLES.includes(role)) {
    throw { status: 400, message: 'دور غير صالح' };
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });

  // Audit log
  try {
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'ROLE_CHANGE',
        entity: 'User',
        entityId: id,
        after: { role },
      },
    });
  } catch { /* non-blocking */ }

  return user;
}

async function setCustomPermissions(id, customPermissions, adminId) {
  // Validate all permissions exist
  const invalid = customPermissions.filter((p) => !VALID_PERMISSIONS.includes(p));
  if (invalid.length > 0) {
    throw { status: 400, message: 'صلاحيات غير صالحة', invalid };
  }

  const user = await prisma.user.update({
    where: { id },
    data: { customPermissions },
    select: {
      id: true, name: true, role: true, customPermissions: true,
    },
  });

  const effectivePermissions = permissionsForUser({
    role: user.role,
    customPermissions: user.customPermissions || [],
  });

  // Audit log
  try {
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'CUSTOM_PERMISSIONS_SET',
        entity: 'User',
        entityId: id,
        after: { customPermissions },
      },
    });
  } catch { /* non-blocking */ }

  return { ...user, effectivePermissions };
}

async function setTempPassword(id, tempPassword, adminId) {
  if (!tempPassword || tempPassword.length < 8) {
    throw { status: 400, message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' };
  }

  const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (!target) throw { status: 404, message: 'المستخدم غير موجود' };
  if (target.role === 'ADMIN') {
    throw { status: 400, message: 'لا يمكن تعيين كلمة مرور مؤقتة لمدير النظام' };
  }

  const hash = await bcrypt.hash(tempPassword, 12);
  await prisma.user.update({
    where: { id },
    data: {
      passwordHash: hash,
      mustChangePassword: true,
      passwordResetRequest: false,
      passwordResetAt: null,
    },
  });

  // Audit log
  try {
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'TEMP_PASSWORD_SET',
        entity: 'User',
        entityId: id,
      },
    });
  } catch { /* non-blocking */ }

  return { message: 'تم تعيين كلمة المرور المؤقتة' };
}

module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  softDeleteUser,
  changeRole,
  setCustomPermissions,
  setTempPassword,
};
