# Contributing to Charity Hub

## Development Workflow
1. **Branching**: Create feature branches from `main` (e.g., `feature/scoring-updates`, `fix/login-bug`).
2. **Commit Messages**: Use semantic commit messages (`feat:`, `fix:`, `docs:`, `refactor:`).
3. **Pull Requests**: All PRs must pass automated checks before merging.

## Running Tests
### Backend
We use Jest for unit and integration testing.
```bash
cd backend
npm run test
```

### Frontend
We use Playwright for E2E testing.
```bash
cd frontend
npx playwright test
```

## Architectural Rules
- **No business logic in the frontend.** The frontend is purely presentation. The backend Scoring Engine is the sole source of truth.
- **Do not mutate ScoreResult records.** They are immutable. If a score needs updating, trigger a recalculation which inserts a new record.
- **Use Decimal.** All monetary values and weights must be calculated using Prisma `Decimal` to avoid precision issues.

## Localization
- The frontend supports both Arabic (`ar`) and English (`en`).
- Always use `next-intl` translation hooks (`t()`). Do not hardcode user-facing strings.
- Add new translations to the JSON files in `frontend/messages/`.
