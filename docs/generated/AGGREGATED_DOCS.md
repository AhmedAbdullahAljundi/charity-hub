## CharityHub — Aggregated Codebase Documentation

This document provides an organized, study-ready overview of the project's Database (Prisma), Backend (Express + Prisma), and Frontend (Next.js + React) code. It is a first-pass, detailed reference covering main files and flows. Use it to navigate the codebase and continue to per-file docs if you want deeper line-by-line explanations.

---

**Project layout (high-level)**

- `backend/`: Express server, Prisma database client, routes, modules, services, middleware.
- `backend/prisma/`: `schema.prisma`, `seed.js`, and migration SQL files.
- `frontend/`: Next.js app (app directory), React components, client stores and API helpers.

---

**How to run (developer)**

- Backend: from `backend/` run `npm install` then `npm run dev` (reads `.env`). Ensure `DATABASE_URL` is set.
- Frontend: from `frontend/` run `pnpm install` then `pnpm dev` (Next.js).
- To seed DB: from `backend/` run `npx prisma db seed` (uses `backend/prisma/seed.js`).

---

**Database (Prisma)**

- File: `backend/prisma/schema.prisma`
  - Contains a normalized PostgreSQL schema for Family/Person/Income/Medical/Education, scoring and RBAC models (Role, Permission, User, AuditLog).
  - Key models: `Family`, `Person`, `Income`, `MedicalCase`, `EducationRecord`, `Assistance`, `Scoring`, `ScoringRule`, `Role`, `Permission`, `User`, `AuditLog`.
  - Enums: `HousingType`, `RoleInFamily`, `Gender`, `MaritalStatus`, `EducationLevel`, `EducationStage`, `AcademicStatus`, `IncomeSourceType`, `MedicalCategory`, `DiseaseSeverity`, `AssistanceType`, `VulnerabilityClassification`, `SocialStatus`, `AuditAction`.
  - Conventions: UUID `id` fields, `created_at` and `updated_at` timestamps, `@@map` to table names.

- File: `backend/prisma/seed.js`
  - Uses `initializeRolesAndPermissions()` from `src/services/rbac/rbacService` to create roles, permissions and mappings.
  - Run with `npx prisma db seed`.

- Migrations: stored under `backend/prisma/migrations/*` and include SQL for initial schema and later workflow changes.

Notes:

- The schema is optimized for PMT scoring: `Scoring` caches results and `ScoringRule` keeps coefficients.
- Audit logs stored in `AuditLog` record changes with `old_data`/`new_data` JSON.

---

**Backend (Express + Prisma)**

Top-level files

- `backend/src/app.js`
  - Creates Express app with middleware: `helmet`, `cors` (configured from `config/env.js`), `express.json`, compression.
  - Registers `/api/v1` routes and exposes health check on `/api/health`.
  - Registers `notFoundHandler` and `errorHandler` middleware.

- `backend/src/server.js`
  - Imports the app and `prisma` client and starts server on `config.app.port`.
  - Implements graceful shutdown that disconnects Prisma before exit and handles `SIGINT`, `SIGTERM`, and unhandled rejections.

Configuration

- `backend/src/config/env.js`
  - Loads environment variables via `dotenv` and exposes `config` object (app port, env, baseUrl, `DATABASE_URL`, JWT secrets, CORS origin, logging level, audit flag).
  - Warns if `DATABASE_URL` is missing (server will still start for testing).

- `backend/src/config/prisma.js`
  - Exports a singleton `PrismaClient` configured to log queries in development.
  - Registers `beforeExit`, `SIGINT`, `SIGTERM` handlers to disconnect cleanly.

Routes & API

- `backend/src/routes/api.v1.js`
  - Mounts sub-routers:
    - `/auth` → `modules/auth/auth.routes`
    - `/families` → `modules/families/families.routes`
    - `/scoring`, `/members`, `/income`, `/expenses`, `/medical` → their module routes
  - Also exposes a simple `/health` endpoint.

Middleware

- `backend/src/middleware/auth.js`
  - `requireAuth(req,res,next)`: verifies JWT token via `auth.service.verifyToken()`. In development, if `REQUIRE_AUTH` is false, attaches a dev mock user to `req.user`.
  - `optionalAuth(req,res,next)`: attempts verification but does not fail if token absent.

- `backend/src/middleware/errorHandler.js` (registered in `app.js`)
  - Centralized error handler that serializes `AppError` instances and provides Arabic messages where available.

Errors and utilities

- `backend/src/utils/errors.js`
  - Defines `AppError` base class and specialized errors: `ValidationError`, `AuthError`, `ForbiddenError`, `NotFoundError`, `ConflictError`.

- `backend/src/utils/password.js` & `arabicMessages.js`
  - Helpers for password hashing and Arabic message mapping (used across controllers/services).

Modules and Services (selected)

- `backend/src/modules/auth/*`
  - `auth.controller.js` exposes `login`, `getMe`, `logout` handlers.
  - `auth.service.js` (not fully shown) handles token issuance and verification.

- `backend/src/modules/families/families.service.js`
  - `registerFamily(payload)`: main transactional flow to create a `Family` plus related `Person`, `Income`, `MedicalCase`, `EducationRecord` rows inside `prisma.$transaction`.
  - Triggers scoring via `calculateFamilyScore()` from `services/scoring/scoringService` and persists a `Scoring` snapshot.
  - Validates presence of `family` and maps classification codes to Prisma enums.

Key flows and example

- Family registration (HTTP payload derived from `frontend/components/add-family-form.jsx`):

  POST /api/v1/families/register

  Sample payload (simplified):

  {
  "family": { "registration_number": "...", "address": "...", "social_status": "POOR", "housing_type": "RENT" },
  "persons": [{"full_name":"...","national_id":"...","role_in_family":"HUSBAND"}, ...],
  "incomes": [{"source_type":"SALARY","amount":1200}],
  "medicalCases": [...],
  "educationRecords": [...]
  }
  - The backend will create family, persons, incomes, medical and education records and return a scoring snapshot with `vulnerabilityIndex` and `classification`.

---

**Frontend (Next.js + React)**

Layout

- `frontend/app/layout.tsx` and `frontend/app/page.tsx` (main entry)
  - `app/page.tsx` redirects to `/dashboard` and shows a small loading skeleton.

API client

- `frontend/lib/api.js`
  - Axios instance with `baseURL` from `NEXT_PUBLIC_API_URL`, JSON headers and `Accept-Language: ar`.
  - Attaches token from `localStorage` to `Authorization` header.
  - Response interceptor removes token and redirects to `/login` on `401`.

Client store

- `frontend/lib/store.js`
  - Uses `zustand` (`useAuthStore`, `useDashboardStore`, `useFamiliesStore`).
  - Persists auth state to `localStorage` (`charityhub-auth`).
  - Provides sample dashboard statistics, family lists, lists of categories and constants used in forms.

UI & Important components

- `frontend/components/add-family-form.jsx`
  - Implements `AddFamilyForm` using `react-hook-form` and `zod` for validation.
  - Builds normalized payload and posts to `/v1/families/register` using `frontend/lib/api`.
  - Maps UI category values to normalized `social_status` enum values expected by the backend.

- `frontend/components/app-sidebar.jsx`, `topbar.jsx`, `dashboard-charts.jsx`, `family-profile-tabs.jsx` — UI components used across the dashboard.

Notes about localization and UX

- The frontend uses Arabic text throughout (labels, validation messages).
- The client store contains default/mock values to allow quick UI testing without backend.

---

**Migrations & Seed**

- Migrations are in `backend/prisma/migrations/*` — SQL files reflect schema changes across versions.
- `backend/prisma/seed.js` initializes RBAC (roles/permissions) using `services/rbac/rbacService`.

---

**Quick study checklist (recommended)**

1. Read `backend/prisma/schema.prisma` to understand the data model and enums.
2. Open `backend/src/config/env.js` and `backend/src/config/prisma.js` to learn runtime config and DB client lifecycle.
3. Follow the HTTP flow: `frontend/components/add-family-form.jsx` → `frontend/lib/api.js` → `backend/src/routes/api.v1.js` → `backend/src/modules/families/*` → `prisma` models.
4. Inspect `backend/src/services/scoring/*` to understand PMT calculation assumptions (scoring coefficients live in `ScoringRule`).
5. Seed RBAC: run `npx prisma db seed` and inspect `role`, `permission`, `role_permissions` tables.

---

If you'd like, I can now:

- generate per-file markdown docs under `docs/generated/files/` (one file → one doc) with function/class-level descriptions and examples, or
- expand this aggregated doc into a PDF or printable study guide.

Tell me which option you prefer and I'll continue. (I can start generating per-file docs now.)
