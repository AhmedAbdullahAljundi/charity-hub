# Authentication Module Documentation

## Overview

Complete authentication system with JWT tokens, password hashing, and RBAC integration.

## Architecture

### Clean Architecture Separation

- **Controller** (`auth.controller.js`) - HTTP request handlers (thin layer)
- **Service** (`auth.service.js`) - Business logic (authentication, token generation)
- **Validator** (`auth.validator.js`) - Input validation using Joi
- **Routes** (`auth.routes.js`) - API route definitions

## API Endpoints

### POST /api/v1/auth/login

**Request:**
```json
{
  "email": "admin@charityhub.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "تم تسجيل الدخول بنجاح",
  "data": {
    "user": {
      "id": "uuid",
      "name": "أحمد محمد",
      "email": "admin@charityhub.com",
      "role": {
        "id": "uuid",
        "name": "Admin"
      },
      "permissions": ["CREATE_FAMILY", "UPDATE_FAMILY", ...]
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "البريد الإلكتروني أو كلمة المرور غير صحيحة",
  "code": "INVALID_CREDENTIALS"
}
```

### GET /api/v1/auth/me

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "أحمد محمد",
    "email": "admin@charityhub.com",
    "role": {
      "id": "uuid",
      "name": "Admin"
    },
    "permissions": ["CREATE_FAMILY", "UPDATE_FAMILY", ...]
  }
}
```

### POST /api/v1/auth/logout

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "تم تسجيل الخروج بنجاح"
}
```

## JWT Token Structure

### Payload

```json
{
  "userId": "uuid",
  "role": "Admin",
  "permissions": ["CREATE_FAMILY", "UPDATE_FAMILY", "DELETE_FAMILY", ...],
  "email": "admin@charityhub.com",
  "iat": 1234567890,
  "exp": 1234654290,
  "iss": "charityhub",
  "aud": "charityhub-users"
}
```

### Token Configuration

- **Expiration:** 24 hours
- **Algorithm:** HS256
- **Secret:** From `JWT_SECRET` environment variable
- **Issuer:** `charityhub`
- **Audience:** `charityhub-users`

## Security Features

### Password Hashing

- **Algorithm:** bcryptjs
- **Salt Rounds:** 10
- **Storage:** Hashed passwords only in database

### Token Security

- **HTTP Bearer Scheme:** `Authorization: Bearer <token>`
- **Token Verification:** On every protected request
- **No Database Query:** Permissions embedded in token
- **Expiration:** 24 hours

### Input Validation

- **Email:** Valid email format
- **Password:** Minimum 6 characters
- **Validation Library:** Joi

## Usage Examples

### Login Flow

```javascript
// 1. User sends credentials
POST /api/v1/auth/login
{
  "email": "admin@charityhub.com",
  "password": "password123"
}

// 2. Server validates and returns token
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// 3. Client stores token (localStorage/sessionStorage)
localStorage.setItem('auth_token', token)

// 4. Client sends token in subsequent requests
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Protected Route Access

```javascript
// Route definition
router.post(
  '/families',
  requireAuth,                    // Verify token
  requirePermission('CREATE_FAMILY'), // Check permission
  familiesController.create
)

// Request
POST /api/v1/families
Headers: {
  Authorization: Bearer <token>
}
Body: { ... }
```

## Middleware Integration

### requireAuth

Verifies JWT token and attaches user to `req.user`:

```javascript
req.user = {
  userId: "uuid",
  email: "admin@charityhub.com",
  role: "Admin",
  permissions: ["CREATE_FAMILY", ...]
}
```

### requirePermission

Checks if user has specific permission (from token payload):

```javascript
router.post(
  '/families',
  requireAuth,
  requirePermission('CREATE_FAMILY'),
  controller.create
)
```

## Error Handling

All errors follow standardized format:

```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "Error message in Arabic",
  "details": {}
}
```

### Common Error Codes

- `AUTH_REQUIRED` - Token missing
- `INVALID_TOKEN` - Token invalid
- `TOKEN_EXPIRED` - Token expired
- `INVALID_CREDENTIALS` - Wrong email/password
- `PERMISSION_DENIED` - Missing permission

## Testing

### Using Postman

1. **Login:**
   ```
   POST http://localhost:5000/api/v1/auth/login
   Body: {
     "email": "admin@charityhub.com",
     "password": "password123"
   }
   ```

2. **Copy token from response**

3. **Use token in protected routes:**
   ```
   GET http://localhost:5000/api/v1/families
   Headers: {
     Authorization: Bearer <token>
   }
   ```

## Best Practices

1. **Store token securely** - Use httpOnly cookies in production
2. **Handle token expiration** - Implement refresh token or re-login
3. **Validate input** - Always validate before processing
4. **Hash passwords** - Never store plain text passwords
5. **Use HTTPS** - Always in production
6. **Rate limiting** - Implement on login endpoint

## Future Enhancements

- Refresh tokens
- Password reset flow
- Email verification
- Two-factor authentication
- Token blacklisting
- Session management
