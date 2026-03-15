# Quick Database Setup Script
# This script helps you set up the database

Write-Host "🗄️ CharityHub Database Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is accessible
Write-Host "Checking PostgreSQL connection..." -ForegroundColor Yellow

try {
    $pgVersion = psql --version 2>$null
    if ($pgVersion) {
        Write-Host "✅ PostgreSQL found: $pgVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  PostgreSQL command not found in PATH" -ForegroundColor Yellow
    Write-Host "   Make sure PostgreSQL is installed and added to PATH" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Choose setup method:" -ForegroundColor Cyan
Write-Host "1. Automatic (Prisma creates database) - RECOMMENDED ⭐" -ForegroundColor White
Write-Host "2. Manual (You create database in pgAdmin/psql)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter choice (1 or 2)"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "🚀 Automatic Setup Selected" -ForegroundColor Green
    Write-Host ""
    Write-Host "Steps:" -ForegroundColor Yellow
    Write-Host "1. Make sure PostgreSQL is running" -ForegroundColor White
    Write-Host "2. Edit backend/.env and set DATABASE_URL" -ForegroundColor White
    Write-Host "   Example: DATABASE_URL=postgresql://postgres:password@localhost:5432/charityhub?schema=public" -ForegroundColor Gray
    Write-Host "3. Run: cd backend && npm run prisma:migrate" -ForegroundColor White
    Write-Host ""
    Write-Host "Prisma will:" -ForegroundColor Cyan
    Write-Host "  ✅ Create database 'charityhub' automatically" -ForegroundColor Green
    Write-Host "  ✅ Create all tables automatically" -ForegroundColor Green
    Write-Host ""
    
    $continue = Read-Host "Ready to run migration? (y/n)"
    if ($continue -eq "y" -or $continue -eq "Y") {
        Set-Location "D:\Charity_Hub\backend"
        Write-Host "Running Prisma Migrate..." -ForegroundColor Yellow
        npm run prisma:migrate
    }
    
} elseif ($choice -eq "2") {
    Write-Host ""
    Write-Host "📝 Manual Setup Selected" -ForegroundColor Green
    Write-Host ""
    Write-Host "Steps:" -ForegroundColor Yellow
    Write-Host "1. Open pgAdmin or psql" -ForegroundColor White
    Write-Host "2. Create database named 'charityhub'" -ForegroundColor White
    Write-Host ""
    Write-Host "In pgAdmin:" -ForegroundColor Cyan
    Write-Host "  - Right-click 'Databases' → Create → Database" -ForegroundColor Gray
    Write-Host "  - Name: charityhub" -ForegroundColor Gray
    Write-Host ""
    Write-Host "In psql:" -ForegroundColor Cyan
    Write-Host "  psql -U postgres" -ForegroundColor Gray
    Write-Host "  CREATE DATABASE charityhub;" -ForegroundColor Gray
    Write-Host "  \q" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Edit backend/.env and set DATABASE_URL" -ForegroundColor White
    Write-Host "4. Run: cd backend && npm run prisma:migrate" -ForegroundColor White
    Write-Host ""
    
} else {
    Write-Host "Invalid choice!" -ForegroundColor Red
}

Write-Host ""
Write-Host "📚 For detailed instructions, see: DATABASE_SETUP.md" -ForegroundColor Cyan
