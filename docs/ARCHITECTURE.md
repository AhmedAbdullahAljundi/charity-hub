# Architecture Overview

Charity Hub is built using a modern, decoupled architecture designed for scale, maintainability, and strict adherence to data integrity rules.

## Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Zustand (state management), Recharts, next-intl.
- **Backend**: Node.js 20, Express, PostgreSQL 16, Prisma 5.
- **Deployment**: Docker, Docker Compose, NGINX.

## Core Principles
1. **Scoring Engine as Single Source of Truth**: All scoring logic resides exclusively in the backend. The frontend is entirely deterministic and relies on backend responses for scoring layers, recommendations, and rules.
2. **Immutability**: `ScoreResult` records are append-only. Recalculation creates a new record, allowing full historical auditing.
3. **Decimal Safety**: Prisma `Decimal` type is used throughout the stack to prevent floating-point inaccuracies.
4. **Separation of Concerns**: The scoring domain is decoupled from Express routing. The frontend is strictly a visualization and data entry layer.

## System Components
### Backend
- **Modules**: Grouped by feature (`auth`, `admin`, `household`, `scoring`, `verification`, `simulate`).
- **Domains**: The `scoring` domain contains the pure logic for evaluating households across Layers 1-8.
- **Middlewares**: Centralized error handling, Zod validation, JWT authentication, RBAC, and rate limiting.

### Frontend
- **Wizard**: Multi-step form with auto-save and live simulation.
- **Dashboard**: High-level analytics and queues.
- **Admin**: Rule editing and override management.
- **Verification**: Bulk verification queues for income sources.

## Caching Strategy
- **Rules Cache**: Predefined weights and rules are cached in memory.
- **Analytics Cache**: Dashboard aggregations are cached for 15 minutes to reduce DB load. Invalidation occurs on new calculations or rule changes.
