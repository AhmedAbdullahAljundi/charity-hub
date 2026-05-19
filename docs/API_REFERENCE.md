# API Reference

All endpoints are prefixed with `/api`.

## Authentication (`/api/auth`)
- `POST /login`: Authenticates a user and returns JWT tokens.
- `POST /refresh`: Issues a new access token using a refresh token.
- `POST /logout`: Invalidates the current session.
- `GET /me`: Returns the current user profile.

## Household & Verification (`/api/households`, `/api/verification`)
- `GET /households`: Lists households with pagination and filtering.
- `POST /households`: Creates a new household draft.
- `GET /households/:id`: Retrieves a full household profile.
- `GET /verification`: Lists items pending verification.
- `PATCH /verification/bulk`: Bulk approves or rejects verification items.

## Scoring & Simulation (`/api/scoring`, `/api/simulate`)
- `POST /scoring/:id/recalculate`: Triggers the scoring engine and persists a new ScoreResult.
- `GET /scoring/:id/history`: Retrieves the history of calculations.
- `PATCH /scoring/:id/decide`: Records a human decision overriding the system recommendation.
- `POST /simulate`: Runs the scoring engine ephemerally with hypothetical modifications (no DB persistence).

## Admin (`/api/admin`)
- `GET /rules`: Lists all system rules and weights.
- `PUT /rules/:id/override`: Sets a manual override for a specific rule weight.
- `DELETE /rules/:id/revert`: Reverts a rule back to its base weight.
- `POST /rules/:id/simulate`: Simulates the impact of a rule change across all households.

## Analytics & Audit (`/api/analytics`, `/api/audit`)
- `GET /analytics/dashboard`: Returns aggregate metrics for the dashboard.
- `GET /audit`: Returns paginated audit logs for system actions.
- `GET /health`: System health and status check.
