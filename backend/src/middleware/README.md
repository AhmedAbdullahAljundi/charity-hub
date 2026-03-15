# Middleware Documentation

## Overview

This directory contains Express middleware for authentication, authorization, and request processing.

## Authentication Middleware

### `auth.js`

#### `requireAuth`

Verifies JWT token and attaches user to `req.user`. Must be used before any RBAC middleware.

```javascript
const { requireAuth } = require('./middleware/auth');

router.get('/protected', requireAuth, controller.handler);
```

**Request Object After Authentication:**
```javascript
req.user = {
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

#### `optionalAuth`

Attaches user if token is present, but doesn't fail if missing. Useful for public routes that show different content for authenticated users.

```javascript
const { optionalAuth } = require('./middleware/auth');

router.get('/public', optionalAuth, controller.handler);
```

## RBAC Middleware

### `rbac.js`

All RBAC middleware requires `requireAuth` to be called first.

#### `requirePermission(permissionName)`

Requires user to have a specific permission.

```javascript
const { requirePermission } = require('./middleware/rbac');

router.post(
  '/families',
  requireAuth,
  requirePermission('CREATE_FAMILY'),
  controller.create
);
```

#### `requireAnyPermission(permissionNames)`

Requires user to have at least one of the specified permissions.

```javascript
const { requireAnyPermission } = require('./middleware/rbac');

router.get(
  '/reports',
  requireAuth,
  requireAnyPermission(['VIEW_SCORING', 'VIEW_AUDIT_LOG']),
  controller.getReports
);
```

#### `requireAllPermissions(permissionNames)`

Requires user to have all specified permissions.

```javascript
const { requireAllPermissions } = require('./middleware/rbac');

router.post(
  '/families/:id/medical',
  requireAuth,
  requireAllPermissions(['UPDATE_FAMILY', 'APPROVE_MEDICAL']),
  controller.updateMedical
);
```

#### `requireRole(roleName)`

Requires user to have a specific role.

```javascript
const { requireRole } = require('./middleware/rbac');

router.delete(
  '/families/:id',
  requireAuth,
  requireRole('Admin'),
  controller.delete
);
```

#### `requireAnyRole(roleNames)`

Requires user to have at least one of the specified roles.

```javascript
const { requireAnyRole } = require('./middleware/rbac');

router.get(
  '/scoring',
  requireAuth,
  requireAnyRole(['Admin', 'MedicalOfficer', 'Auditor']),
  controller.list
);
```

#### `requireAdmin()`

Convenience function for requiring Admin role.

```javascript
const { requireAdmin } = require('./middleware/rbac');

router.get(
  '/admin/dashboard',
  requireAuth,
  requireAdmin(),
  controller.dashboard
);
```

## Usage Examples

### Basic Route Protection

```javascript
const { requireAuth } = require('./middleware/auth');
const { requirePermission } = require('./middleware/rbac');

// Public route
router.get('/public', controller.public);

// Authenticated route
router.get('/profile', requireAuth, controller.profile);

// Permission-protected route
router.post('/families', 
  requireAuth,
  requirePermission('CREATE_FAMILY'),
  controller.create
);
```

### Complex Route Protection

```javascript
// Multiple checks
router.put('/families/:id',
  requireAuth, // Must be authenticated
  requireAnyRole(['Admin', 'DataEntry', 'MedicalOfficer']), // Must have one role
  requirePermission('UPDATE_FAMILY'), // Must have permission
  controller.update
);
```

### Conditional Access

```javascript
// Different access levels
router.get('/families',
  requireAuth,
  optionalPermission('VIEW_SCORING'), // Show more if has permission
  controller.list
);
```

## Error Responses

### Authentication Required (401)

```json
{
  "success": false,
  "code": "AUTH_REQUIRED",
  "message": "يجب تسجيل الدخول للوصول إلى هذا المورد",
  "statusCode": 401
}
```

### Permission Denied (403)

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

### Role Denied (403)

```json
{
  "success": false,
  "code": "ROLE_DENIED",
  "message": "ليس لديك صلاحية للوصول إلى هذا المورد",
  "details": {
    "requiredRole": "Admin"
  },
  "statusCode": 403
}
```

## Environment Variables

Required for authentication:

```env
JWT_ACCESS_SECRET=your-secret-key-here
# OR
JWT_SECRET=your-secret-key-here
```

## Best Practices

1. **Always use `requireAuth` first** before any RBAC middleware
2. **Use permissions for fine-grained control** instead of roles when possible
3. **Cache user data** in `req.user` to avoid repeated database queries
4. **Use `requireAnyRole` or `requireAnyPermission`** for flexible access
5. **Document permission requirements** in route comments
6. **Handle errors gracefully** with proper error middleware

## Security Considerations

1. **JWT Secret**: Use strong, random secrets
2. **Token Expiration**: Set appropriate expiration times
3. **HTTPS**: Always use HTTPS in production
4. **Rate Limiting**: Implement rate limiting for auth endpoints
5. **Audit Logging**: Log all permission-denied attempts
