# 🎯 News Viewer Authentication System
## Complete Implementation Guide

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Features](#features)
5. [File Structure](#file-structure)
6. [Setup Guide](#setup-guide)
7. [Usage](#usage)
8. [API Reference](#api-reference)
9. [Troubleshooting](#troubleshooting)
10. [Next Steps](#next-steps)

---

## Overview

A complete authentication system for the News Viewer application with:
- **Backend**: FastAPI with JWT authentication
- **Frontend**: React with modern minimalist design
- **Database**: PostgreSQL with user management
- **Security**: Bcrypt password hashing, JWT tokens

### Technology Stack

**Backend:**
- FastAPI 0.109.0
- AsyncPG 0.29.0
- Passlib 1.7.4 (bcrypt)
- Python-JOSE 3.3.0 (JWT)

**Frontend:**
- React 19.2.0
- React Router 7.11.0
- Tailwind CSS 4.1.18
- Vite 7.2.4
- TypeScript 5.9.3

---

## Quick Start

### 1️⃣ Database Setup
```bash
psql -U your_username -d telegram_news -f backend/schema_users.sql
```

### 2️⃣ Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# Edit .env with your database credentials
python manage_users.py  # Create a user
```

### 3️⃣ Frontend Setup
```bash
cd frontend
npm install
copy .env.example .env
```

### 4️⃣ Start Application
```bash
# Option 1: Use the startup script
.\start.bat

# Option 2: Manual (two terminals)
# Terminal 1:
cd backend && venv\Scripts\activate && python main.py

# Terminal 2:
cd frontend && npm run dev
```

### 5️⃣ Access
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## Architecture

### System Flow

```
User → Login Page → FastAPI Backend → PostgreSQL
                         ↓
                    JWT Token
                         ↓
                  Protected Routes
                         ↓
                    Dashboard
```

### Component Structure

**Frontend:**
```
LoginPage → AuthContext → API Call → Token Storage
                ↓
        ProtectedRoute → Dashboard
```

**Backend:**
```
API Route → Dependency (JWT Validation) → Database Query → Response
```

---

## Features

### ✅ Implemented

**Backend:**
- JWT token authentication
- Bcrypt password hashing
- Database connection pooling
- Modular route structure
- Environment configuration
- CORS middleware
- User management CLI
- Protected endpoints

**Frontend:**
- Modern minimalist UI
- Protected routes
- Authentication context
- Login page with validation
- Dashboard with stats
- Logout functionality
- Smooth animations
- Responsive design
- Error handling
- Loading states

### 🔜 To Be Implemented (By You)

- News listing
- Channel management
- Image gallery
- Search & filtering
- Real statistics
- Pagination
- Export functionality

---

## File Structure

```
news_viewer/
│
├── backend/
│   ├── routes/
│   │   ├── __init__.py          # Package init
│   │   ├── auth.py              # Auth endpoints
│   │   └── dashboard.py         # Dashboard endpoints
│   │
│   ├── auth_utils.py            # Password & JWT utils
│   ├── config.py                # Configuration
│   ├── database.py              # DB connection pool
│   ├── dependencies.py          # FastAPI dependencies
│   ├── main.py                  # Main application
│   ├── models.py                # Pydantic models
│   ├── manage_users.py          # User management
│   ├── schema_users.sql         # User table schema
│   ├── requirements.txt         # Dependencies
│   ├── .env.example             # Env template
│   └── .gitignore               # Git ignore
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   └── DashboardPage.tsx
│   │   ├── config/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   └── index.css
│   │
│   └── .env.example
│
├── README.md                    # Main documentation
├── QUICK_REFERENCE.md           # Command reference
├── SETUP_CHECKLIST.md           # Setup checklist
├── IMPLEMENTATION_SUMMARY.md    # Implementation details
├── setup.ps1                    # Setup script
└── start.bat                    # Startup script
```

---

## Setup Guide

### Prerequisites
- PostgreSQL (running)
- Python 3.8+
- Node.js 18+
- npm

### Detailed Steps

#### 1. Database Configuration

Create the users table:
```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);
```

Run the schema:
```bash
psql -U your_username -d telegram_news -f backend/schema_users.sql
```

#### 2. Backend Configuration

Install dependencies:
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

Configure environment:
```bash
copy .env.example .env
```

Edit `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=telegram_news
DB_USER=your_db_user
DB_PASSWORD=your_db_password
SECRET_KEY=your-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALLOWED_ORIGINS=http://localhost:5173
```

Create user:
```bash
python manage_users.py
# Choose option 1, enter username and password
```

#### 3. Frontend Configuration

Install dependencies:
```bash
cd frontend
npm install
```

Configure environment:
```bash
copy .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:8000
```

---

## Usage

### Starting the Application

**Method 1: Automated (Recommended)**
```bash
.\start.bat
```

**Method 2: Manual**

Terminal 1 (Backend):
```bash
cd backend
venv\Scripts\activate
python main.py
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### User Management

Add user:
```bash
cd backend
python manage_users.py
# Option 1: Add new user
```

List users:
```bash
python manage_users.py
# Option 2: List all users
```

### Testing the Application

1. Open http://localhost:5173
2. Login with created credentials
3. Verify redirect to dashboard
4. Check user info in header
5. Test logout functionality

---

## API Reference

### Public Endpoints

**Root**
```
GET /
Response: {"message": "News Viewer API", "version": "1.0.0", "status": "running"}
```

**Health Check**
```
GET /health
Response: {"status": "healthy"}
```

**Login**
```
POST /auth/login
Body: {"username": "string", "password": "string"}
Response: {"access_token": "string", "token_type": "bearer"}
```

### Protected Endpoints

**Get Current User**
```
GET /auth/me
Headers: Authorization: Bearer <token>
Response: {
  "id": 1,
  "username": "admin",
  "created_at": "2026-01-02T...",
  "last_login": "2026-01-02T..."
}
```

**Logout**
```
POST /auth/logout
Headers: Authorization: Bearer <token>
Response: {"message": "Successfully logged out"}
```

**Dashboard Stats**
```
GET /dashboard/stats
Headers: Authorization: Bearer <token>
Response: {
  "message": "Dashboard stats endpoint",
  "user": "admin",
  "stats": {
    "total_messages": 0,
    "total_channels": 0,
    "total_images": 0
  }
}
```

---

## Troubleshooting

### Backend Issues

**Problem: Backend won't start**
```bash
# Check virtual environment
venv\Scripts\activate

# Check database connection
psql -U your_username -d telegram_news -c "\dt"

# Verify .env file
type .env
```

**Problem: Database connection error**
- Verify PostgreSQL is running
- Check credentials in `.env`
- Ensure database exists
- Check if users table exists

### Frontend Issues

**Problem: Frontend won't start**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check .env file
type .env
```

**Problem: Can't connect to API**
- Verify backend is running
- Check `VITE_API_URL` in `.env`
- Check browser console (F12)
- Verify CORS settings

### Login Issues

**Problem: Login fails**
- Verify user exists: `python manage_users.py` → option 2
- Check username/password
- Check backend logs
- Check browser console
- Verify JWT SECRET_KEY is set

**Problem: CORS errors**
- Add frontend URL to `ALLOWED_ORIGINS` in backend `.env`
- Restart backend after changing `.env`

---

## Next Steps

### Immediate Tasks

1. ✅ Complete setup using checklist
2. ✅ Test authentication flow
3. ✅ Familiarize with codebase

### Development Roadmap

**Phase 1: News Listing**
- Create news listing page
- Fetch messages from database
- Display in table/card format
- Add pagination

**Phase 2: Channel Management**
- List channels
- Add/edit/delete channels
- Filter news by channel

**Phase 3: Image Gallery**
- Display images
- Lightbox view
- Filter by channel/date

**Phase 4: Search & Filter**
- Full-text search
- Date range filter
- Channel filter
- Export results

**Phase 5: Statistics**
- Real dashboard data
- Charts and graphs
- Trends analysis

---

## Security Notes

- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens with expiration
- ✅ Parameterized SQL queries
- ✅ CORS configured
- ✅ Environment variables protected

**Production Checklist:**
- Change SECRET_KEY
- Enable HTTPS
- Restrict ALLOWED_ORIGINS
- Set strong database password
- Configure firewall
- Set up monitoring

---

## Support & Documentation

- **Main README**: `README.md`
- **Quick Reference**: `QUICK_REFERENCE.md`
- **Setup Checklist**: `SETUP_CHECKLIST.md`
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`
- **API Docs**: http://localhost:8000/docs

---

## License

Part of the News OSINT collection system.

---

**Status: ✅ Ready for Development**

The authentication system is complete and tested. You can now focus on implementing news-related features!

**Happy Coding! 🚀**
