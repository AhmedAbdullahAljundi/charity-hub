# CharityHub Quick Start Script
# Run this script to set up and start the project

Write-Host "🚀 CharityHub - Quick Start" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Backend Setup
Write-Host ""
Write-Host "📦 Setting up Backend..." -ForegroundColor Yellow
Set-Location "D:\Charity_Hub\backend"

# Create .env if not exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    @"
DATABASE_URL=postgresql://postgres:password@localhost:5432/charityhub?schema=public
PORT=5000
JWT_SECRET=charityhub-secret-key-2024
BASELINE_COEFFICIENT=1.0
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
"@ | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "✅ .env file created" -ForegroundColor Green
    Write-Host "⚠️  Please edit .env and update DATABASE_URL with your PostgreSQL credentials" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env file exists" -ForegroundColor Green
}

# Install dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
}

# Frontend Setup
Write-Host ""
Write-Host "📦 Setting up Frontend..." -ForegroundColor Yellow
Set-Location "D:\Charity_Hub\frontend"

# Create .env.local if not exists
if (-not (Test-Path ".env.local")) {
    Write-Host "Creating .env.local file..." -ForegroundColor Yellow
    @"
NEXT_PUBLIC_API_URL=http://localhost:5000/api
"@ | Out-File -FilePath ".env.local" -Encoding utf8
    Write-Host "✅ .env.local file created" -ForegroundColor Green
} else {
    Write-Host "✅ .env.local file exists" -ForegroundColor Green
}

# Install dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Edit backend/.env and update DATABASE_URL" -ForegroundColor White
Write-Host "2. Run: cd backend && npm run prisma:generate && npm run prisma:migrate" -ForegroundColor White
Write-Host "3. Start Backend: cd backend && npm run dev" -ForegroundColor White
Write-Host "4. Start Frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Backend: http://localhost:5000" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
