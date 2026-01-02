# Quick Reference Guide

## 🚀 Starting the Application

### Option 1: Using the startup script (Recommended)
```bash
# Double-click start.bat or run:
.\start.bat
```

### Option 2: Manual startup

**Terminal 1 - Backend:**
```bash
cd backend
venv\Scripts\activate
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## 👤 User Management

### Add a new user
```bash
cd backend
venv\Scripts\activate
python manage_users.py
# Choose option 1
```

### List all users
```bash
cd backend
venv\Scripts\activate
python manage_users.py
# Choose option 2
```

## 🔧 Common Commands

### Backend

```bash
# Install dependencies
pip install -r requirements.txt

# Run server
python main.py

# Or with uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Create database table
psql -U your_username -d telegram_news -f schema_users.sql
```

### Frontend

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📍 URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **API Redoc**: http://localhost:8000/redoc

## 🔑 Default Login

After creating a user with `manage_users.py`, use those credentials to login.

Example:
- Username: `admin`
- Password: (whatever you set)

## 📁 Important Files

### Backend
- `main.py` - Main application entry point
- `config.py` - Configuration settings
- `routes/auth.py` - Authentication endpoints
- `manage_users.py` - User management script
- `.env` - Environment variables (create from .env.example)

### Frontend
- `src/App.tsx` - Main React component
- `src/pages/LoginPage.tsx` - Login page
- `src/pages/DashboardPage.tsx` - Dashboard page
- `src/contexts/AuthContext.tsx` - Authentication state
- `.env` - Environment variables (create from .env.example)

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if virtual environment is activated
# You should see (venv) in your terminal prompt

# Check database connection
psql -U your_username -d telegram_news -c "\dt"

# Verify .env file exists and has correct values
cat .env  # or type .env on Windows
```

### Frontend won't start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json  # or rmdir /s node_modules on Windows
npm install

# Check if .env file exists
cat .env  # or type .env on Windows
```

### Can't login
```bash
# Verify user exists
cd backend
python manage_users.py
# Choose option 2 to list users

# Check backend logs for errors
# Check browser console (F12) for errors
```

### CORS errors
```bash
# Verify ALLOWED_ORIGINS in backend/.env includes:
# http://localhost:5173

# Restart backend after changing .env
```

## 📊 API Testing

You can test the API using the built-in Swagger UI:

1. Start the backend server
2. Open http://localhost:8000/docs
3. Try the endpoints:
   - POST /auth/login
   - GET /auth/me (requires token)
   - GET /dashboard/stats (requires token)

## 🔐 Security Notes

- **Change SECRET_KEY** in backend/.env before production
- **Never commit .env files** to version control
- **Use strong passwords** for user accounts
- **Enable HTTPS** in production
- **Restrict ALLOWED_ORIGINS** in production

## 📝 Next Development Steps

1. Implement news listing page
2. Add channel management
3. Create image gallery
4. Add search and filtering
5. Implement pagination
6. Add real-time updates
7. Create admin panel

## 🎨 Customization

### Change color scheme
Edit `frontend/src/index.css` and modify the CSS variables under `:root` and `.dark`

### Change API port
- Backend: Edit `main.py` (default: 8000)
- Frontend: Update `VITE_API_URL` in `.env`

### Change token expiration
Edit `ACCESS_TOKEN_EXPIRE_MINUTES` in backend/.env (default: 60 minutes)

## 📚 Tech Stack Reference

### Backend
- FastAPI: https://fastapi.tiangolo.com/
- AsyncPG: https://magicstack.github.io/asyncpg/
- Passlib: https://passlib.readthedocs.io/
- Python-JOSE: https://python-jose.readthedocs.io/

### Frontend
- React: https://react.dev/
- React Router: https://reactrouter.com/
- Tailwind CSS: https://tailwindcss.com/
- Vite: https://vitejs.dev/
