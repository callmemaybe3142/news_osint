# News Viewer - Quick Setup Guide

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "News Viewer - Quick Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is accessible
Write-Host "Step 1: Database Setup" -ForegroundColor Yellow
Write-Host "---------------------------------------"
Write-Host "Please ensure PostgreSQL is running and you have created the database."
Write-Host ""
Write-Host "To create the users table, run:" -ForegroundColor Green
Write-Host "  psql -U your_username -d telegram_news -f backend\schema_users.sql"
Write-Host ""
$dbSetup = Read-Host "Have you created the users table? (y/n)"

if ($dbSetup -ne "y") {
    Write-Host "Please set up the database first, then run this script again." -ForegroundColor Red
    exit
}

# Backend setup
Write-Host ""
Write-Host "Step 2: Backend Setup" -ForegroundColor Yellow
Write-Host "---------------------------------------"

Set-Location backend

# Check if venv exists
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Green
    python -m venv venv
}

Write-Host "Activating virtual environment..." -ForegroundColor Green
& "venv\Scripts\Activate.ps1"

Write-Host "Installing Python dependencies..." -ForegroundColor Green
pip install -r requirements.txt

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host ""
    Write-Host "Creating .env file from template..." -ForegroundColor Green
    Copy-Item ".env.example" ".env"
    Write-Host ""
    Write-Host "IMPORTANT: Please edit backend\.env with your database credentials!" -ForegroundColor Red
    Write-Host "Required settings:" -ForegroundColor Yellow
    Write-Host "  - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD"
    Write-Host "  - SECRET_KEY (change from default!)"
    Write-Host ""
    $envEdit = Read-Host "Have you edited the .env file? (y/n)"
    
    if ($envEdit -ne "y") {
        Write-Host "Please edit backend\.env, then run this script again." -ForegroundColor Red
        Set-Location ..
        exit
    }
}

# Create a user
Write-Host ""
Write-Host "Step 3: Create Admin User" -ForegroundColor Yellow
Write-Host "---------------------------------------"
$createUser = Read-Host "Do you want to create a user now? (y/n)"

if ($createUser -eq "y") {
    python manage_users.py
}

Set-Location ..

# Frontend setup
Write-Host ""
Write-Host "Step 4: Frontend Setup" -ForegroundColor Yellow
Write-Host "---------------------------------------"

Set-Location frontend

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Green
    Copy-Item ".env.example" ".env"
}

Write-Host "Installing Node dependencies..." -ForegroundColor Green
npm install

Set-Location ..

# Final instructions
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Start Backend (in one terminal):" -ForegroundColor Green
Write-Host "   cd backend"
Write-Host "   venv\Scripts\Activate.ps1"
Write-Host "   python main.py"
Write-Host ""
Write-Host "2. Start Frontend (in another terminal):" -ForegroundColor Green
Write-Host "   cd frontend"
Write-Host "   npm run dev"
Write-Host ""
Write-Host "3. Open browser:" -ForegroundColor Green
Write-Host "   http://localhost:5173"
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
