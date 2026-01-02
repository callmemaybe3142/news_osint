# News Viewer - Authentication System

A modern, minimalist news viewer application with secure authentication built with FastAPI and React.

## 🏗️ Architecture

### Backend (FastAPI)
- **Modular structure** with separated concerns
- **JWT-based authentication** with bcrypt password hashing
- **AsyncPG** for PostgreSQL database operations
- **Connection pooling** for optimal performance

### Frontend (React + Vite)
- **Modern minimalist design** with Tailwind CSS
- **Protected routes** with React Router v7
- **Context-based authentication** state management
- **Smooth animations** and transitions

## 📁 Project Structure

```
news_viewer/
├── backend/
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py          # Authentication endpoints
│   │   └── dashboard.py     # Dashboard endpoints (placeholder)
│   ├── auth_utils.py        # Password hashing & JWT utilities
│   ├── config.py            # Configuration management
│   ├── database.py          # Database connection pool
│   ├── dependencies.py      # FastAPI dependencies
│   ├── main.py              # Main application
│   ├── models.py            # Pydantic models
│   ├── manage_users.py      # User management script
│   ├── schema_users.sql     # User table schema
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment template
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── ProtectedRoute.tsx
    │   ├── contexts/
    │   │   └── AuthContext.tsx
    │   ├── pages/
    │   │   ├── LoginPage.tsx
    │   │   └── DashboardPage.tsx
    │   ├── config/
    │   │   └── api.ts
    │   ├── App.tsx
    │   └── index.css
    └── .env.example
```

## 🚀 Setup Instructions

### 1. Database Setup

First, create the user table in your PostgreSQL database:

```bash
cd backend
psql -U your_username -d telegram_news -f schema_users.sql
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from template
copy .env.example .env  # Windows
# cp .env.example .env  # Linux/Mac

# Edit .env file with your database credentials
# Update: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, SECRET_KEY
```

### 3. Create a User

```bash
# Run the user management script
python manage_users.py

# Choose option 1 to add a new user
# Enter username and password when prompted
```

### 4. Start Backend Server

```bash
# Make sure you're in the backend directory with venv activated
python main.py

# Or use uvicorn directly:
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### 5. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file from template
copy .env.example .env  # Windows
# cp .env.example .env  # Linux/Mac

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🔐 API Endpoints

### Authentication
- `POST /auth/login` - Login with username and password
- `GET /auth/me` - Get current user info (requires authentication)
- `POST /auth/logout` - Logout (client-side token removal)

### Dashboard
- `GET /dashboard/stats` - Get dashboard statistics (requires authentication)

### Health
- `GET /` - Root endpoint
- `GET /health` - Health check

## 🎨 Features

### Backend
- ✅ JWT token-based authentication
- ✅ Bcrypt password hashing
- ✅ Database connection pooling
- ✅ Modular route structure
- ✅ Environment-based configuration
- ✅ User management script
- ✅ CORS configuration

### Frontend
- ✅ Modern minimalist UI design
- ✅ Protected route system
- ✅ Authentication context
- ✅ Login page with validation
- ✅ Dashboard placeholder
- ✅ Logout functionality
- ✅ Smooth animations
- ✅ Dark mode support (via Tailwind)
- ✅ Responsive design

## 🛠️ User Management

The `manage_users.py` script provides an interactive CLI for user management:

```bash
python manage_users.py
```

Options:
1. **Add new user** - Create a new user with username and password
2. **List all users** - View all users in the database
3. **Exit**

## 🔒 Security Features

- **Password Hashing**: Bcrypt with automatic salt generation
- **JWT Tokens**: Secure token-based authentication
- **Token Expiration**: Configurable token lifetime (default: 60 minutes)
- **Protected Routes**: Frontend routes require valid authentication
- **CORS**: Configured allowed origins for API security

## 📝 Environment Variables

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=telegram_news
DB_USER=your_db_user
DB_PASSWORD=your_db_password
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## 🎯 Next Steps

This authentication system is ready for you to add news-related features:

1. **News Listing** - Display messages from the database
2. **Channel Management** - View and manage Telegram channels
3. **Image Gallery** - Browse collected images
4. **Search & Filter** - Search messages and filter by channel
5. **Statistics** - Real-time dashboard statistics

## 📚 Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **AsyncPG** - Async PostgreSQL driver
- **Passlib** - Password hashing library
- **Python-JOSE** - JWT token handling
- **Uvicorn** - ASGI server

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router v7** - Routing
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

## 🐛 Troubleshooting

### Backend won't start
- Check database connection settings in `.env`
- Ensure PostgreSQL is running
- Verify user table exists: `psql -d telegram_news -c "\dt users"`

### Frontend can't connect to API
- Verify backend is running on port 8000
- Check `VITE_API_URL` in frontend `.env`
- Check CORS settings in backend `config.py`

### Login fails
- Ensure user exists in database
- Verify password is correct
- Check browser console for error messages
- Verify JWT SECRET_KEY is set in backend `.env`

## 📄 License

This project is part of the News OSINT collection system.

---

**Built with ❤️ using FastAPI and React**
