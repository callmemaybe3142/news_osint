---
description: Deploy Next.js app to VPS with Nginx and SSL
---

# Deployment Guide for www.d4a.site

This guide assumes you have a VPS with Ubuntu/Debian, Nginx installed, and access to the server via SSH.

## 1. Prepare the VPS Environment
Ensure Node.js (LTS version) and PM2 are installed on your VPS.

```bash
# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2
```

## 2. Deploy the Code
Navigate to your web directory (e.g., `/var/www`) and clone your repository.

```bash
cd /var/www
git clone <your-repo-url> myanmar_conflict_news
cd myanmar_conflict_news
```

## 3. Install Dependencies & Build
Install the dependencies and build the Next.js application for production.

```bash
# Install dependencies
npm install

# Build the application
npm run build
```

## 4. Configure Environment Variables
Create a `.env.production` file with your production database credentials.

```bash
nano .env.production
```

Add your content:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/your_db"
NEXT_PUBLIC_BASE_URL="https://www.d4a.site"
```

## 5. Start Application with PM2
Start the Next.js server using PM2 to keep it running in the background.

```bash
pm2 start npm --name "myanmar-dashboard" -- start
pm2 save
```

## 6. Configure Nginx
Create a new Nginx server block for `www.d4a.site`.

```bash
sudo nano /etc/nginx/sites-available/d4a.site
```

Paste the following configuration:

```nginx
server {
    server_name www.d4a.site;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/d4a.site /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 7. Setup SSL (HTTPS)
Use Certbot to automatically configure SSL certificates.

```bash
sudo certbot --nginx -d www.d4a.site
```

## 8. Verification
Visit `https://www.d4a.site` to verify the deployment.
