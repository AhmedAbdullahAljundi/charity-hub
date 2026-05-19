# Security Model

## Authentication
Charity Hub uses JWT-based authentication.
- **Access Tokens**: Short-lived (15m default), used for API authorization.
- **Refresh Tokens**: Long-lived (7d default), used to obtain new access tokens.
- Passwords are hashed using `bcrypt` (cost factor 10).

## Role-Based Access Control (RBAC)
The system defines 4 primary roles:
- **ADMIN**: Full system access, including rule overriding, user management, and system logs.
- **SUPERVISOR**: Can view all cases, assign workers, and perform bulk verification. Can record `HumanDecision` on scored households.
- **WORKER**: Can create and edit households, trigger calculations, but cannot override rules or record final decisions.
- **GUEST**: Read-only access to public statistics (if enabled).

Permissions are enforced via the `requirePermission` and `requireRoles` Express middlewares.

## Data Protection
- **PII Masking**: Personal Identifiable Information (like national IDs) are masked in general API responses and logs.
- **Sanitization**: All incoming request bodies pass through a simple HTML-stripping sanitizer to prevent XSS.
- **Rate Limiting**: Brute-force protection on `/login` (5 req / 15m). Standard API limits (200 req / 1h) and calculation limits (30 req / 1h) are enforced via `express-rate-limit`.

## Audit Logging
Every mutable action (create, update, delete, verify, decide) is recorded in the `AuditLog` table.
- Logs track `userId`, `action`, `entity`, `ip`, and exact `before`/`after` JSON diffs.
- Sensitive fields (`passwordHash`, `tokenHash`) are explicitly excluded from the diff generator.
