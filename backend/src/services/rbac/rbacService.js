/**
 * RBAC Service
 * 
 * Manages roles, permissions, and role-permission mappings
 */

const prisma = require('../../config/prisma');
const { AppError, NotFoundError } = require('../../utils/errors');

/**
 * Role names
 */
const ROLES = {
  ADMIN: 'Admin',
  DATA_ENTRY: 'DataEntry',
  MEDICAL_OFFICER: 'MedicalOfficer',
  AUDITOR: 'Auditor',
};

/**
 * Permission names
 */
const PERMISSIONS = {
  CREATE_FAMILY: 'CREATE_FAMILY',
  UPDATE_FAMILY: 'UPDATE_FAMILY',
  DELETE_FAMILY: 'DELETE_FAMILY',
  VIEW_SCORING: 'VIEW_SCORING',
  APPROVE_MEDICAL: 'APPROVE_MEDICAL',
  VIEW_AUDIT_LOG: 'VIEW_AUDIT_LOG',
};

/**
 * Role-Permission mappings
 */
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.CREATE_FAMILY,
    PERMISSIONS.UPDATE_FAMILY,
    PERMISSIONS.DELETE_FAMILY,
    PERMISSIONS.VIEW_SCORING,
    PERMISSIONS.APPROVE_MEDICAL,
    PERMISSIONS.VIEW_AUDIT_LOG,
  ],
  [ROLES.DATA_ENTRY]: [
    PERMISSIONS.CREATE_FAMILY,
    PERMISSIONS.UPDATE_FAMILY,
    PERMISSIONS.VIEW_SCORING,
  ],
  [ROLES.MEDICAL_OFFICER]: [
    PERMISSIONS.UPDATE_FAMILY,
    PERMISSIONS.VIEW_SCORING,
    PERMISSIONS.APPROVE_MEDICAL,
  ],
  [ROLES.AUDITOR]: [
    PERMISSIONS.VIEW_SCORING,
    PERMISSIONS.VIEW_AUDIT_LOG,
  ],
};

/**
 * Get user with role and permissions
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} User with role and permissions
 */
async function getUserWithPermissions(userId) {
  if (!userId) {
    throw new AppError('User ID is required', 400, 'VALIDATION_ERROR');
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Extract permission names
    const permissions = user.role.rolePermissions.map(
      (rp) => rp.permission.name
    );

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: {
        id: user.role.id,
        name: user.role.name,
      },
      permissions,
    };
  } catch (error) {
    if (error instanceof AppError || error instanceof NotFoundError) {
      throw error;
    }

    console.error('Error fetching user permissions:', error);
    throw new AppError(
      'Failed to fetch user permissions',
      500,
      'RBAC_ERROR',
      { originalError: error.message }
    );
  }
}

/**
 * Check if user has specific permission
 * @param {string} userId - User UUID
 * @param {string} permissionName - Permission name
 * @returns {Promise<boolean>} True if user has permission
 */
async function userHasPermission(userId, permissionName) {
  try {
    const user = await getUserWithPermissions(userId);
    return user.permissions.includes(permissionName);
  } catch (error) {
    console.error('Error checking user permission:', error);
    return false;
  }
}

/**
 * Check if user has any of the specified permissions
 * @param {string} userId - User UUID
 * @param {Array<string>} permissionNames - Array of permission names
 * @returns {Promise<boolean>} True if user has at least one permission
 */
async function userHasAnyPermission(userId, permissionNames) {
  try {
    const user = await getUserWithPermissions(userId);
    return permissionNames.some((perm) => user.permissions.includes(perm));
  } catch (error) {
    console.error('Error checking user permissions:', error);
    return false;
  }
}

/**
 * Check if user has all specified permissions
 * @param {string} userId - User UUID
 * @param {Array<string>} permissionNames - Array of permission names
 * @returns {Promise<boolean>} True if user has all permissions
 */
async function userHasAllPermissions(userId, permissionNames) {
  try {
    const user = await getUserWithPermissions(userId);
    return permissionNames.every((perm) => user.permissions.includes(perm));
  } catch (error) {
    console.error('Error checking user permissions:', error);
    return false;
  }
}

/**
 * Check if user has specific role
 * @param {string} userId - User UUID
 * @param {string} roleName - Role name
 * @returns {Promise<boolean>} True if user has role
 */
async function userHasRole(userId, roleName) {
  try {
    const user = await getUserWithPermissions(userId);
    return user.role.name === roleName;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
}

/**
 * Check if user has any of the specified roles
 * @param {string} userId - User UUID
 * @param {Array<string>} roleNames - Array of role names
 * @returns {Promise<boolean>} True if user has at least one role
 */
async function userHasAnyRole(userId, roleNames) {
  try {
    const user = await getUserWithPermissions(userId);
    return roleNames.includes(user.role.name);
  } catch (error) {
    console.error('Error checking user roles:', error);
    return false;
  }
}

/**
 * Initialize roles and permissions in database
 * Creates roles, permissions, and role-permission mappings if they don't exist
 * @returns {Promise<Object>} Summary of created records
 */
async function initializeRolesAndPermissions() {
  try {
    const summary = {
      rolesCreated: 0,
      permissionsCreated: 0,
      rolePermissionsCreated: 0,
    };

    // Create permissions
    const permissionMap = {};
    for (const [key, name] of Object.entries(PERMISSIONS)) {
      const existing = await prisma.permission.findUnique({
        where: { name },
      });
      
      if (!existing) {
        const permission = await prisma.permission.create({
          data: { name },
        });
        permissionMap[name] = permission;
        summary.permissionsCreated++;
      } else {
        permissionMap[name] = existing;
      }
    }

    // Create roles and assign permissions
    for (const [key, roleName] of Object.entries(ROLES)) {
      let role = await prisma.role.findUnique({
        where: { name: roleName },
      });
      
      if (!role) {
        role = await prisma.role.create({
          data: { name: roleName },
        });
        summary.rolesCreated++;
      }

      // Assign permissions to role
      const rolePermissions = ROLE_PERMISSIONS[roleName] || [];
      for (const permName of rolePermissions) {
        const permission = permissionMap[permName];
        if (permission) {
          // Check if mapping already exists
          const existing = await prisma.rolePermission.findUnique({
            where: {
              role_id_permission_id: {
                role_id: role.id,
                permission_id: permission.id,
              },
            },
          });
          
          if (!existing) {
            await prisma.rolePermission.create({
              data: {
                role_id: role.id,
                permission_id: permission.id,
              },
            });
            summary.rolePermissionsCreated++;
          }
        }
      }
    }

    return summary;
  } catch (error) {
    console.error('Error initializing roles and permissions:', error);
    throw new AppError(
      'Failed to initialize roles and permissions',
      500,
      'RBAC_ERROR',
      { originalError: error.message }
    );
  }
}

module.exports = {
  // Constants
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  
  // User permission checks
  getUserWithPermissions,
  userHasPermission,
  userHasAnyPermission,
  userHasAllPermissions,
  userHasRole,
  userHasAnyRole,
  
  // Initialization
  initializeRolesAndPermissions,
};
