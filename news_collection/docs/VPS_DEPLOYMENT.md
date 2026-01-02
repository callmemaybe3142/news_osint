# Running Collector on VPS - Production Guide

## 🎯 Best Methods (Ranked)

### **1. Systemd Service** ⭐ **RECOMMENDED**
- ✅ Auto-starts on boot
- ✅ Auto-restarts on crash
- ✅ Proper logging
- ✅ Easy management
- ✅ Production-ready

### **2. Screen/Tmux**
- ✅ Quick and easy
- ✅ Good for testing
- ❌ No auto-restart
- ❌ Manual management

### **3. Nohup**
- ✅ Very simple
- ❌ No auto-restart
- ❌ Poor logging
- ❌ Not recommended

---

## 🚀 Method 1: Systemd Service (RECOMMENDED)

### **Step 1: Create Service File**

```bash
sudo nano /etc/systemd/system/news-collector.service
```

**Paste this:**
```ini
[Unit]
Description=Telegram News Collector
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/news_osint/news_collection
Environment="PATH=/usr/bin:/usr/local/bin"
EnvironmentFile=/etc/news_osint/.env

# Run collector
ExecStart=/usr/bin/python3 /var/www/news_osint/news_collection/collector.py

# Restart on failure
Restart=on-failure
RestartSec=10

# Logging
StandardOutput=append:/var/log/news_osint/collector.log
StandardError=append:/var/log/news_osint/collector-error.log

# Security
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

### **Step 2: Setup Directories**

```bash
# Create directories
sudo mkdir -p /var/www/news_osint
sudo mkdir -p /var/log/news_osint
sudo mkdir -p /var/lib/news_osint/images
sudo mkdir -p /etc/news_osint

# Set permissions
sudo chown -R www-data:www-data /var/www/news_osint
sudo chown -R www-data:www-data /var/log/news_osint
sudo chown -R www-data:www-data /var/lib/news_osint

# Move your code
sudo cp -r ~/news_osint/news_collection /var/www/news_osint/

# Move .env file
sudo cp ~/news_osint/news_collection/.env /etc/news_osint/.env
sudo chmod 600 /etc/news_osint/.env
```

### **Step 3: Enable and Start Service**

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service (auto-start on boot)
sudo systemctl enable news-collector

# Start service
sudo systemctl start news-collector

# Check status
sudo systemctl status news-collector
```

### **Step 4: Manage Service**

```bash
# Start
sudo systemctl start news-collector

# Stop
sudo systemctl stop news-collector

# Restart
sudo systemctl restart news-collector

# Check status
sudo systemctl status news-collector

# View logs (live)
sudo journalctl -u news-collector -f

# View logs (last 100 lines)
sudo journalctl -u news-collector -n 100

# View logs (today)
sudo journalctl -u news-collector --since today
```

---

## 📋 Method 2: Screen (Quick & Easy)

### **Install Screen**

```bash
sudo apt install screen
```

### **Run Collector in Screen**

```bash
# Start a new screen session
screen -S collector

# Navigate to project
cd ~/news_osint/news_collection

# Run collector
python3 collector.py

# Detach from screen (Ctrl+A, then D)
# Press Ctrl+A, release, then press D
```

### **Manage Screen Sessions**

```bash
# List all screen sessions
screen -ls

# Reattach to session
screen -r collector

# Kill session
screen -X -S collector quit

# Detach from inside screen
# Press: Ctrl+A, then D
```

---

## 📺 Method 3: Tmux (Alternative to Screen)

### **Install Tmux**

```bash
sudo apt install tmux
```

### **Run Collector in Tmux**

```bash
# Start new tmux session
tmux new -s collector

# Navigate to project
cd ~/news_osint/news_collection

# Run collector
python3 collector.py

# Detach from tmux (Ctrl+B, then D)
# Press Ctrl+B, release, then press D
```

### **Manage Tmux Sessions**

```bash
# List sessions
tmux ls

# Attach to session
tmux attach -t collector

# Kill session
tmux kill-session -t collector

# Detach from inside tmux
# Press: Ctrl+B, then D
```

---

## 🔧 Method 4: Nohup (Simple but Limited)

```bash
# Navigate to project
cd ~/news_osint/news_collection

# Run with nohup
nohup python3 collector.py > collector.log 2>&1 &

# Get process ID
echo $!

# Check if running
ps aux | grep collector.py

# View logs
tail -f collector.log

# Stop (find PID first)
ps aux | grep collector.py
kill <PID>
```

---

## 🔄 Cron Job (Scheduled Runs)

### **Run Collector Every Hour**

```bash
# Edit crontab
crontab -e

# Add this line (runs every hour)
0 * * * * cd /var/www/news_osint/news_collection && /usr/bin/python3 collector.py >> /var/log/news_osint/cron.log 2>&1

# Or every 6 hours
0 */6 * * * cd /var/www/news_osint/news_collection && /usr/bin/python3 collector.py >> /var/log/news_osint/cron.log 2>&1

# Or daily at 2 AM
0 2 * * * cd /var/www/news_osint/news_collection && /usr/bin/python3 collector.py >> /var/log/news_osint/cron.log 2>&1
```

---

## 📊 Comparison

| Method | Auto-Start | Auto-Restart | Logging | Ease | Production |
|--------|-----------|--------------|---------|------|------------|
| **Systemd** | ✅ | ✅ | ✅ | Medium | ✅ Best |
| **Screen** | ❌ | ❌ | ⚠️ | Easy | ⚠️ OK |
| **Tmux** | ❌ | ❌ | ⚠️ | Easy | ⚠️ OK |
| **Nohup** | ❌ | ❌ | ⚠️ | Very Easy | ❌ No |
| **Cron** | ✅ | ⚠️ | ⚠️ | Easy | ⚠️ OK |

---

## 🎯 Recommended Setup

### **For Production: Systemd Service**

**Why:**
- ✅ Starts automatically on server boot
- ✅ Restarts automatically if crashed
- ✅ Proper logging with journalctl
- ✅ Easy to manage (start/stop/restart)
- ✅ Runs as specific user (security)
- ✅ Industry standard

**Setup:**
```bash
# 1. Create service file
sudo nano /etc/systemd/system/news-collector.service

# 2. Enable and start
sudo systemctl enable news-collector
sudo systemctl start news-collector

# 3. Check status
sudo systemctl status news-collector

# Done! Runs forever, even after SSH disconnect
```

---

## 🔍 Monitoring

### **Check if Collector is Running**

**Systemd:**
```bash
sudo systemctl status news-collector
```

**Screen:**
```bash
screen -ls
```

**Tmux:**
```bash
tmux ls
```

**Process:**
```bash
ps aux | grep collector.py
```

### **View Logs**

**Systemd:**
```bash
# Live logs
sudo journalctl -u news-collector -f

# Last 100 lines
sudo journalctl -u news-collector -n 100

# Today's logs
sudo journalctl -u news-collector --since today

# Errors only
sudo journalctl -u news-collector -p err
```

**Screen/Tmux:**
```bash
# Reattach to see output
screen -r collector
# or
tmux attach -t collector
```

**Log File:**
```bash
tail -f /var/log/news_osint/collector.log
```

---

## 🚨 Troubleshooting

### **Service Won't Start**

```bash
# Check status
sudo systemctl status news-collector

# View detailed logs
sudo journalctl -u news-collector -n 50

# Check permissions
ls -la /var/www/news_osint/news_collection/

# Test manually
cd /var/www/news_osint/news_collection
sudo -u www-data python3 collector.py
```

### **Service Keeps Restarting**

```bash
# View logs
sudo journalctl -u news-collector -f

# Check for errors
sudo journalctl -u news-collector -p err

# Increase restart delay
sudo nano /etc/systemd/system/news-collector.service
# Change: RestartSec=30
sudo systemctl daemon-reload
sudo systemctl restart news-collector
```

### **Can't Find Logs**

```bash
# Create log directory
sudo mkdir -p /var/log/news_osint
sudo chown www-data:www-data /var/log/news_osint

# Check journalctl
sudo journalctl -u news-collector -n 100
```

---

## 📝 Complete Production Setup

### **Step-by-Step Guide**

```bash
# 1. Install dependencies
sudo apt update
sudo apt install python3 python3-pip postgresql

# 2. Create directories
sudo mkdir -p /var/www/news_osint
sudo mkdir -p /var/log/news_osint
sudo mkdir -p /var/lib/news_osint/images
sudo mkdir -p /etc/news_osint

# 3. Upload your code
scp -r news_collection user@your-vps:/tmp/
sudo mv /tmp/news_collection /var/www/news_osint/

# 4. Install Python dependencies
cd /var/www/news_osint/news_collection
sudo pip3 install -r requirements.txt

# 5. Setup .env file
sudo nano /etc/news_osint/.env
# Paste your configuration
sudo chmod 600 /etc/news_osint/.env

# 6. Setup PostgreSQL
sudo -u postgres psql
CREATE DATABASE news_collection;
CREATE USER news_collector WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE news_collection TO news_collector;
\q

# 7. Initialize schema
psql -U news_collector -d news_collection -f /var/www/news_osint/news_collection/schema_postgresql.sql

# 8. Set permissions
sudo chown -R www-data:www-data /var/www/news_osint
sudo chown -R www-data:www-data /var/log/news_osint
sudo chown -R www-data:www-data /var/lib/news_osint

# 9. Create systemd service
sudo nano /etc/systemd/system/news-collector.service
# Paste service configuration

# 10. Enable and start
sudo systemctl daemon-reload
sudo systemctl enable news-collector
sudo systemctl start news-collector

# 11. Check status
sudo systemctl status news-collector

# 12. View logs
sudo journalctl -u news-collector -f
```

---

## 🎉 Summary

### **Quick Start (Screen - Testing)**
```bash
screen -S collector
cd ~/news_osint/news_collection
python3 collector.py
# Press Ctrl+A, then D to detach
```

### **Production Setup (Systemd)**
```bash
# Create service file
sudo nano /etc/systemd/system/news-collector.service

# Enable and start
sudo systemctl enable news-collector
sudo systemctl start news-collector

# Check status
sudo systemctl status news-collector
```

### **View Logs**
```bash
# Systemd
sudo journalctl -u news-collector -f

# Screen
screen -r collector
```

**Your collector will now run forever, even after SSH disconnect!** 🚀
