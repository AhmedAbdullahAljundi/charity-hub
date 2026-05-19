# Deployment Guide

Charity Hub is designed to be deployed using Docker and Docker Compose.

## Prerequisites
- Docker Engine & Docker Compose
- Node.js 20 (for local development)
- PostgreSQL 16 (if not using the compose file)

## Environment Setup
1. Copy `.env.example` to `.env` in the root directory.
2. Generate secure random strings for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.
3. Set `NODE_ENV=production`.
4. Define your `DATABASE_URL`.

## Building and Running
To launch the entire stack (Frontend, Backend, Database):
```bash
docker-compose up -d --build
```

### Initializing the Database
The backend container uses a startup script (`backend/scripts/startup.sh`) that automatically runs `npx prisma migrate deploy` before launching the Node server. If you need to seed the database initially:
```bash
docker-compose exec backend npm run seed
```

## Production Considerations
- **Standalone Build**: The Next.js frontend is configured with `output: 'standalone'`, optimizing the Docker image size.
- **Security Context**: Both frontend and backend Dockerfiles switch to a non-root user (`USER node` and `USER nextjs`) before execution.
- **Reverse Proxy**: Use the provided `nginx/nginx.conf` as a starting point to route traffic and handle SSL termination.
