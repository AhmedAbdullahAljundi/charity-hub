# RBAC System Documentation

## Overview

The Role-Based Access Control (RBAC) system provides fine-grained permission management for CharityHub. It supports roles, permissions, and role-permission mappings stored in the database.

## Roles

| Role | Description |
|------|-------------|
| **Admin** | Full system access with all permissions |
| **DataEntry** | Can create and update families, view scoring |
| **MedicalOfficer** | Can update families, view scoring, approve medical services |
| **Auditor** | Read-only access to scoring and audit logs |

## Permissions

| Permission | Description |
|------------|-------------|
| `CREATE_FAMILY` | Create new family records |
| `UPDATE_FAMILY` | Update existing family records |
| `DELETE_FAMILY` | Delete family records |
| `VIEW_SCORING` | View family scoring and vulnerability indexes |
| `APPROVE_MEDICAL` | Approve medical service requests |
| `VIEW_AUDIT_LOG` | View system audit logs |

## Role-Permission Matrix

| Permission | Admin | DataEntry | MedicalOfficer | Auditor |
|------------|-------|-----------|----------------|---------|
| `CREATE_FAMILY` | ✅ | ✅ | ❌ | ❌ |
| `UPDATE_FAMILY` | ✅ | ✅ | ✅ | ❌ |
| `DELETE_FAMILY` | ✅ | ❌ | ❌ | ❌ |
| `VIEW_SCORING` | ✅ | ✅ | ✅ | ✅ |
| `APPROVE_MEDICAL` | ✅ | ❌ | ✅ | ❌ |
| `VIEW_AUDIT_LOG` | ✅ | ❌ | ❌ | ✅ |

## Usage

### Middleware

#### Authentication

```javascript
const { requireAuth } = require('../middleware/auth');

// Protect route with authentication
router.get('/families', requireAuth, familiesController.list);
```

#### Permission-Based Access

```javascript
const { requirePermission } = require('../middleware/rbac');

// Require specific permission
router.post(
  '/families',
  requireAuth,
  requirePermission('CREATE_FAMILY'),
  familiesController.create
);

router.delete(
  '/families/:id',
  requireAuth,
  requirePermission('DELETE_FAMILY'),
  familiesController.delete
);
```

#### Role-Based Access

```javascript
const { requireRole, requireAnyRole } = require('../middleware/rbac');

// Require specific role
router.get(
  '/admin/users',
  requireAuth,
  requireRole('Admin'),
  adminController.listUsers
);

// Require any of multiple roles
router.get(
  '/scoring',
  requireAuth,
  requireAnyRole(['Admin', 'MedicalOfficer', 'Auditor']),
  scoringController.list
);
```

#### Combined Example

```javascript
const { requireAuth } = require('../middleware/auth');
const { requirePermission, requireAnyRole } = require('../middleware/rbac');

// Complex route protection
router.put(
  '/families/:id',
  requireAuth, // Must be authenticated
  requireAnyRole(['Admin', 'DataEntry', 'MedicalOfficer']), // Must have one of these roles
  requirePermission('UPDATE_FAMILY'), // Must have this permission
  familiesController.update
);
```

### Service Functions

#### Check User Permissions

```javascript
const {
  userHasPermission,
  userHasAnyPermission,
  userHasAllPermissions,
  getUserWithPermissions,
} = require('../services/rbac/rbacService');

// Get user with permissions
const user = await getUserWithPermissions(userId);
console.log(user.permissions); // ['CREATE_FAMILY', 'UPDATE_FAMILY', ...]

// Check single permission
const canCreate = await userHasPermission(userId, 'CREATE_FAMILY');

// Check any permission
const canView = await userHasAnyPermission(userId, ['VIEW_SCORING', 'VIEW_AUDIT_LOG']);

// Check all permissions
const canManage = await userHasAllPermissions(userId, ['CREATE_FAMILY', 'UPDATE_FAMILY']);
```

#### Check User Roles

```javascript
const {
  userHasRole,
  userHasAnyRole,
} = require('../services/rbac/rbacService');

// Check single role
const isAdmin = await userHasRole(userId, 'Admin');

// Check any role
const isStaff = await userHasAnyRole(userId, ['Admin', 'DataEntry', 'MedicalOfficer']);
```

## Initialization

### Seed Database

Run the seed script to initialize roles and permissions:

```bash
npx prisma db seed
```

Or manually:

```javascript
const { initializeRolesAndPermissions } = require('./services/rbac/rbacService');

const summary = await initializeRolesAndPermissions();
console.log(`Created ${summary.rolesCreated} roles`);
console.log(`Created ${summary.permissionsCreated} permissions`);
```

## Request Object

After authentication, `req.user` contains:

```javascript
{
  id: 'user-uuid',
  name: 'أحمد محمد',
  email: 'ahmed@example.com',
  role: {
    id: 'role-uuid',
    name: 'Admin',
  },
  permissions: ['CREATE_FAMILY', 'UPDATE_FAMILY', ...],
}
```

## Error Responses

### Authentication Required

```json
{
  "success": false,
  "code": "AUTH_REQUIRED",
  "message": "يجب تسجيل الدخول للوصول إلى هذا المورد",
  "statusCode": 401
}
```

### Permission Denied

```json
{
  "success": false,
  "code": "PERMISSION_DENIED",
  "message": "ليس لديك الصلاحية المطلوبة",
  "details": {
    "requiredPermission": "DELETE_FAMILY"
  },
  "statusCode": 403
}
```

## Best Practices

1. **Always use `requireAuth` first** before permission/role checks
2. **Use permissions for fine-grained control** instead of roles when possible
3. **Cache user permissions** in `req.user` to avoid repeated database queries
4. **Use `requireAnyRole` or `requireAnyPermission`** for flexible access control
5. **Document permission requirements** in route comments

## Route Protection Examples

### Family Routes

```javascript
// List families - any authenticated user
router.get('/families', requireAuth, familiesController.list);

// Create family - requires CREATE_FAMILY permission
router.post(
  '/families',
  requireAuth,
  requirePermission('CREATE_FAMILY'),
  familiesController.create
);

// Update family - requires UPDATE_FAMILY permission
router.put(
  '/families/:id',
  requireAuth,
  requirePermission('UPDATE_FAMILY'),
  familiesController.update
);

// Delete family - Admin only
router.delete(
  '/families/:id',
  requireAuth,
  requireRole('Admin'),
  familiesController.delete
);
```

### Scoring Routes

```javascript
// View scoring - requires VIEW_SCORING permission
router.get(
  '/scoring/:familyId',
  requireAuth,
  requirePermission('VIEW_SCORING'),
  scoringController.getFamilyScore
);
```

### Medical Routes

```javascript
// Approve medical service - requires APPROVE_MEDICAL permission
router.post(
  '/medical/approve',
  requireAuth,
  requirePermission('APPROVE_MEDICAL'),
  medicalController.approve
);
```

### Audit Routes

```javascript
// View audit logs - requires VIEW_AUDIT_LOG permission
router.get(
  '/audit-logs',
  requireAuth,
  requirePermission('VIEW_AUDIT_LOG'),
  auditController.list
);
```

## Security Considerations

1. **JWT Secret**: Ensure `JWT_ACCESS_SECRET` or `JWT_SECRET` is set in environment variables
2. **Token Expiration**: Configure appropriate token expiration times
3. **HTTPS**: Always use HTTPS in production
4. **Rate Limiting**: Implement rate limiting for authentication endpoints
5. **Audit Logging**: Log all permission-denied attempts

## Future Enhancements

- Resource-level permissions (e.g., user can only update families they created)
- Permission inheritance
- Dynamic role assignment
- Permission caching with Redis
- Permission expiration dates
