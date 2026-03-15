# CharityHub Backend - Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- npm or yarn package manager

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

This will install:
- express
- prisma
- @prisma/client
- dotenv
- cors
- bcrypt
- jsonwebtoken
- helmet
- compression
- joi

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and set:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/charityhub?schema=public"
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
BASELINE_COEFFICIENT=1.0
CORS_ORIGIN=http://localhost:3000
```

**Important:** Replace database credentials with your actual PostgreSQL credentials.

### 3. Initialize Prisma

Generate Prisma Client:

```bash
npm run prisma:generate
```

Create database and run migrations:

```bash
npm run prisma:migrate
```

This will:
- Create the database if it doesn't exist
- Run all migrations
- Create all tables

### 4. Seed Database (Optional)

Initialize roles and permissions:

```bash
npm run seed
```

### 5. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

### 6. Test Health Endpoint

Open browser or use curl:

```bash
curl http://localhost:5000/api/health
```

Expected response:

```json
{
  "status": "CharityHub Backend Running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

## Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run seed` - Seed database with initial data
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Families
- `GET /api/v1/families` - List all families
- `GET /api/v1/families/:id` - Get family by ID
- `POST /api/v1/families` - Create new family
- `PUT /api/v1/families/:id` - Update family
- `DELETE /api/v1/families/:id` - Delete family
- `GET /api/v1/families/:id/score` - Get family scoring

### Scoring
- `GET /api/v1/scoring/:familyId` - Calculate family score

## Troubleshooting

### Database Connection Error

1. Ensure PostgreSQL is running
2. Check DATABASE_URL in `.env`
3. Verify database exists: `psql -U username -d charityhub`

### Port Already in Use

Change PORT in `.env` or kill process using port 5000:

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill
```

### Prisma Migration Issues

Reset database (⚠️ deletes all data):

```bash
npx prisma migrate reset
```

## Next Steps

1. Test API endpoints using Postman or curl
2. Connect frontend (see frontend setup guide)
3. Add authentication
4. Deploy to production
