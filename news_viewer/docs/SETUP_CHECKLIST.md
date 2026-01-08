# 📋 Setup Checklist

Use this checklist to ensure everything is set up correctly.

## Prerequisites
- [ ] PostgreSQL is installed and running
- [ ] Python 3.8+ is installed
- [ ] Node.js 18+ and npm are installed
- [ ] You have access to the `telegram_news` database

## Database Setup
- [ ] Created users table: `psql -U your_username -d telegram_news -f backend/schema_users.sql`
- [ ] Verified table exists: `psql -d telegram_news -c "\dt users"`

## Backend Setup
- [ ] Navigated to backend directory: `cd backend`
- [ ] Created virtual environment: `python -m venv venv`
- [ ] Activated virtual environment: `venv\Scripts\activate`
- [ ] Installed dependencies: `pip install -r requirements.txt`
- [ ] Created `.env` file: `copy .env.example .env`
- [ ] Updated `.env` with database credentials:
  - [ ] DB_HOST
  - [ ] DB_PORT
  - [ ] DB_NAME
  - [ ] DB_USER
  - [ ] DB_PASSWORD
- [ ] Changed SECRET_KEY in `.env` to a secure random string
- [ ] Created at least one user: `python manage_users.py`
- [ ] Tested backend starts: `python main.py`
- [ ] Verified API docs accessible: http://localhost:8000/docs

## Frontend Setup
- [ ] Navigated to frontend directory: `cd frontend`
- [ ] Installed dependencies: `npm install`
- [ ] Created `.env` file: `copy .env.example .env`
- [ ] Verified VITE_API_URL in `.env` (default: http://localhost:8000)
- [ ] Tested frontend starts: `npm run dev`
- [ ] Verified frontend accessible: http://localhost:5173

## Testing
- [ ] Backend is running on port 8000
- [ ] Frontend is running on port 5173
- [ ] Can access login page at http://localhost:5173
- [ ] Can login with created user credentials
- [ ] Redirected to dashboard after login
- [ ] Can see user info in dashboard header
- [ ] Logout button works
- [ ] Redirected to login after logout
- [ ] Cannot access dashboard without login (automatic redirect)

## Optional
- [ ] Reviewed README.md for detailed documentation
- [ ] Reviewed QUICK_REFERENCE.md for common commands
- [ ] Bookmarked API documentation: http://localhost:8000/docs
- [ ] Created multiple test users
- [ ] Tested API endpoints using Swagger UI

## Troubleshooting Checklist

If something doesn't work, check:

### Backend Issues
- [ ] Virtual environment is activated (you see `(venv)` in terminal)
- [ ] All dependencies installed without errors
- [ ] `.env` file exists and has correct values
- [ ] Database is running and accessible
- [ ] Users table exists in database
- [ ] Port 8000 is not in use by another application
- [ ] No errors in backend terminal

### Frontend Issues
- [ ] Node modules installed without errors
- [ ] `.env` file exists
- [ ] Backend is running and accessible
- [ ] Port 5173 is not in use by another application
- [ ] No errors in frontend terminal
- [ ] Browser console (F12) shows no errors

### Login Issues
- [ ] User exists in database (check with `python manage_users.py` option 2)
- [ ] Username and password are correct
- [ ] Backend is running
- [ ] Check browser console for error messages
- [ ] Check backend terminal for error messages
- [ ] CORS is configured correctly in backend/.env

## Production Checklist (When Deploying)

- [ ] Changed SECRET_KEY to a strong random value
- [ ] Updated ALLOWED_ORIGINS to production domain
- [ ] Enabled HTTPS
- [ ] Set strong database password
- [ ] Removed .env from version control
- [ ] Built frontend for production: `npm run build`
- [ ] Configured reverse proxy (nginx/apache)
- [ ] Set up SSL certificates
- [ ] Configured firewall rules
- [ ] Set up database backups
- [ ] Configured logging
- [ ] Set up monitoring

## Next Steps After Setup

Once everything is working:

1. [ ] Read through the codebase to understand the structure
2. [ ] Plan your news-related features
3. [ ] Start implementing news listing functionality
4. [ ] Add channel management features
5. [ ] Implement image gallery
6. [ ] Add search and filtering
7. [ ] Create statistics dashboard

---

**When all items are checked, you're ready to start developing news features! 🎉**
