# Deployment Guide - News Viewer Application

This guide covers deploying the News Viewer application on a VPS with Nginx, HTTPS, and a secure backend configuration.

## Architecture Overview

- **Frontend**: React app served via Nginx with HTTPS
- **Backend**: FastAPI running on localhost (not exposed to public)
- **Reverse Proxy**: Nginx proxies `/api` requests to the backend
- **SSL/TLS**: Let's Encrypt certificates for HTTPS

## Prerequisites

- Ubuntu 20.04+ VPS with root access
- Domain name pointing to your VPS IP
- PostgreSQL database (can be on the same VPS or remote)

## 1. Initial Server Setup

### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Required Packages
```bash
sudo apt install -y python3.10 python3.10-venv python3-pip nginx certbot python3-certbot-nginx git curl
```

### Install Node.js (for building frontend)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

## 2. Setup Application Directory

```bash
# Create application directory
sudo mkdir -p /var/www/news-viewer
sudo chown $USER:$USER /var/www/news-viewer
cd /var/www/news-viewer

# Clone your repository (or upload files)
git clone <your-repo-url> .
# OR upload via scp/rsync
```

## 3. Backend Setup

### Create Python Virtual Environment
```bash
cd /var/www/news-viewer/backend
python3.10 -m venv venv
source venv/bin/activate
```

### Install Python Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Configure Environment Variables
```bash
# Create .env file
nano .env
```

Add the following (adjust values):
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=news_osint
DB_USER=your_db_user
DB_PASSWORD=your_secure_password

# Security
SECRET_KEY=your-very-long-random-secret-key-here-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS (Important: Use your domain)
ALLOWED_ORIGINS=https://yourdomain.com

# Images Path
IMAGES_BASE_PATH=/path/to/your/images
```

### Create Systemd Service for Backend
```bash
sudo nano /etc/systemd/system/news-viewer-backend.service
```

Add the following:
```ini
[Unit]
Description=News Viewer FastAPI Backend
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/news-viewer/backend
Environment="PATH=/var/www/news-viewer/backend/venv/bin"
ExecStart=/var/www/news-viewer/backend/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --workers 4

# Security
NoNewPrivileges=true
PrivateTmp=true

# Restart policy
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### Set Correct Permissions
```bash
sudo chown -R www-data:www-data /var/www/news-viewer/backend
sudo chmod -R 755 /var/www/news-viewer/backend
```

### Start Backend Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable news-viewer-backend
sudo systemctl start news-viewer-backend

# Check status
sudo systemctl status news-viewer-backend
```

## 4. Frontend Setup

### Create Production Environment File
```bash
cd /var/www/news-viewer/frontend
nano .env.production
```

Add:
```env
# API will be accessed through Nginx reverse proxy
VITE_API_URL=/api
VITE_IMAGE_BASE_URL=/api/news/images
```

### Build Frontend
```bash
npm install
npm run build
```

This creates a `dist` folder with production-ready static files.

### Move Build to Nginx Directory
```bash
sudo mkdir -p /var/www/news-viewer/frontend-dist
sudo cp -r dist/* /var/www/news-viewer/frontend-dist/
sudo chown -R www-data:www-data /var/www/news-viewer/frontend-dist
```

## 5. Nginx Configuration

### Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/news-viewer
```

Add the following configuration:
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (will be added by certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Root directory for frontend
    root /var/www/news-viewer/frontend-dist;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;

    # Frontend - Serve static files
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API - Reverse Proxy (NOT exposed to public directly)
    location /api/ {
        # Remove /api prefix when forwarding to backend
        rewrite ^/api/(.*) /$1 break;
        
        # Proxy to local backend
        proxy_pass http://127.0.0.1:8000;
        
        # Proxy headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Disable buffering for SSE/streaming if needed
        proxy_buffering off;
        
        # WebSocket support (if needed in future)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Logs
    access_log /var/log/nginx/news-viewer-access.log;
    error_log /var/log/nginx/news-viewer-error.log;
}
```

### Enable Site
```bash
# Test configuration
sudo nginx -t

# Create symbolic link
sudo ln -s /etc/nginx/sites-available/news-viewer /etc/nginx/sites-enabled/

# Remove default site if exists
sudo rm /etc/nginx/sites-enabled/default

# Reload Nginx
sudo systemctl reload nginx
```

## 6. SSL Certificate Setup (Let's Encrypt)

### Obtain SSL Certificate
```bash
# Make sure your domain points to your VPS IP first
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts:
- Enter your email
- Agree to terms
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

### Auto-Renewal
Certbot automatically sets up renewal. Test it:
```bash
sudo certbot renew --dry-run
```

## 7. Firewall Configuration

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

**Important**: Port 8000 (backend) should NOT be allowed in the firewall. It should only be accessible via localhost.

## 8. Database Setup

If PostgreSQL is on the same server:

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE news_osint;
CREATE USER your_db_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE news_osint TO your_db_user;
\q

# Run schema
cd /var/www/news-viewer/backend
source venv/bin/activate
psql -U your_db_user -d news_osint -f schema_users.sql
```

## 9. Post-Deployment Tasks

### Create Admin User
```bash
cd /var/www/news-viewer/backend
source venv/bin/activate
python manage_users.py
```

### Initialize Favorites Table
```bash
python init_favorites.py
```

### Check Logs
```bash
# Backend logs
sudo journalctl -u news-viewer-backend -f

# Nginx logs
sudo tail -f /var/log/nginx/news-viewer-error.log
sudo tail -f /var/log/nginx/news-viewer-access.log
```

## 10. Maintenance & Updates

### Update Backend
```bash
cd /var/www/news-viewer/backend
git pull  # or upload new files
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart news-viewer-backend
```

### Update Frontend
```bash
cd /var/www/news-viewer/frontend
git pull  # or upload new files
npm install
npm run build
sudo cp -r dist/* /var/www/news-viewer/frontend-dist/
sudo systemctl reload nginx
```

### Backup Database
```bash
# Create backup
sudo -u postgres pg_dump news_osint > backup_$(date +%Y%m%d).sql

# Restore from backup
sudo -u postgres psql news_osint < backup_20260102.sql
```

## 11. Monitoring & Troubleshooting

### Check Service Status
```bash
# Backend
sudo systemctl status news-viewer-backend

# Nginx
sudo systemctl status nginx

# PostgreSQL
sudo systemctl status postgresql
```

### Common Issues

**Backend not starting:**
```bash
# Check logs
sudo journalctl -u news-viewer-backend -n 50

# Check if port 8000 is in use
sudo lsof -i :8000

# Test backend manually
cd /var/www/news-viewer/backend
source venv/bin/activate
uvicorn main:app --host 127.0.0.1 --port 8000
```

**Frontend not loading:**
```bash
# Check Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/news-viewer-error.log

# Verify files exist
ls -la /var/www/news-viewer/frontend-dist/
```

**API calls failing:**
```bash
# Test backend directly from server
curl http://127.0.0.1:8000/health

# Test through Nginx
curl https://yourdomain.com/api/health
```

**SSL Certificate issues:**
```bash
# Renew certificate manually
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

## 12. Security Checklist

- ✅ Backend runs on localhost only (127.0.0.1:8000)
- ✅ Firewall blocks direct access to port 8000
- ✅ HTTPS enabled with valid SSL certificate
- ✅ Strong SECRET_KEY in backend .env
- ✅ Database password is secure
- ✅ CORS configured to allow only your domain
- ✅ Security headers enabled in Nginx
- ✅ Regular backups scheduled
- ✅ System packages kept up to date

## 13. Performance Optimization

### Enable Nginx Caching (Optional)
```nginx
# Add to http block in /etc/nginx/nginx.conf
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m;

# In location /api/ block
proxy_cache api_cache;
proxy_cache_valid 200 5m;
proxy_cache_bypass $http_cache_control;
add_header X-Cache-Status $upstream_cache_status;
```

### Increase Backend Workers
Edit `/etc/systemd/system/news-viewer-backend.service`:
```ini
ExecStart=/var/www/news-viewer/backend/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --workers 8
```

## Support

For issues or questions, check:
- Backend logs: `sudo journalctl -u news-viewer-backend -f`
- Nginx logs: `/var/log/nginx/news-viewer-error.log`
- Application README: `README.md`
