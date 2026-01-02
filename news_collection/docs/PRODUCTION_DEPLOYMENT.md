# Production Deployment Guide

## 📁 File Storage Best Practices

### **Current Structure (Development)**
```
news_osint/
├── news_collection/
│   ├── images/          # ❌ Not ideal for production
│   ├── logs/            # ❌ Will grow indefinitely
│   └── data/            # ❌ SQLite only
```

### **Recommended Structure (Production)**
```
/var/www/news_osint/     # Application code
├── news_collection/
│   ├── collector.py
│   ├── config.py
│   └── ...

/var/lib/news_osint/     # Application data (persistent)
├── images/              # Image storage
│   ├── 2025/            # Year-based organization
│   │   ├── 01/          # Month
│   │   │   ├── 16/      # Day
│   │   │   │   ├── image1.jpg
│   │   │   │   └── image2.jpg

/var/log/news_osint/     # Logs (managed by logrotate)
├── collector.log
├── collector.log.1
├── collector.log.2.gz
└── ...

/etc/news_osint/         # Configuration
├── .env                 # Environment variables
└── config.yaml          # Optional config file
```

---

## 🖼️ Image Storage Solutions

### **Option 1: Local Storage with Date-Based Organization (Recommended for Small-Medium)**

**Benefits:**
- ✅ Simple and fast
- ✅ No external dependencies
- ✅ Easy backup
- ✅ Good for <1TB of images

**Structure:**
```python
# config.py
import os
from datetime import datetime

# Production path
IMAGE_DIR = os.getenv("IMAGE_DIR", "/var/lib/news_osint/images")

def get_image_path(channel_name: str, message_datetime) -> str:
    """Generate organized image path."""
    year = message_datetime.strftime('%Y')
    month = message_datetime.strftime('%m')
    day = message_datetime.strftime('%d')
    
    # /var/lib/news_osint/images/2025/01/16/channelname/
    path = os.path.join(IMAGE_DIR, year, month, day, channel_name)
    os.makedirs(path, exist_ok=True)
    return path
```

**Disk Usage Estimation:**
```
Average image: 200 KB (compressed)
Messages per day: 1,000
Images per message: 0.5 (50% have images)

Daily: 1,000 × 0.5 × 200 KB = 100 MB/day
Monthly: 100 MB × 30 = 3 GB/month
Yearly: 3 GB × 12 = 36 GB/year
```

**Cleanup Strategy:**
```bash
# Delete images older than 1 year
find /var/lib/news_osint/images -type f -mtime +365 -delete

# Or archive to cold storage
tar -czf archive_2024.tar.gz /var/lib/news_osint/images/2024/
aws s3 cp archive_2024.tar.gz s3://news-archive/
rm -rf /var/lib/news_osint/images/2024/
```

---

### **Option 2: Object Storage (S3/MinIO) (Recommended for Large Scale)**

**Benefits:**
- ✅ Unlimited scalability
- ✅ Built-in redundancy
- ✅ CDN integration
- ✅ Automatic backups
- ✅ Cost-effective for >1TB

**Setup:**
```bash
# Install MinIO (self-hosted S3-compatible)
docker run -d \
  -p 9000:9000 \
  -p 9001:9001 \
  --name minio \
  -v /var/lib/minio:/data \
  -e "MINIO_ROOT_USER=admin" \
  -e "MINIO_ROOT_PASSWORD=secretpassword" \
  minio/minio server /data --console-address ":9001"
```

**Code Changes:**
```python
# requirements.txt
boto3>=1.28.0

# image_handler.py
import boto3
from botocore.exceptions import ClientError

class ImageHandler:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            endpoint_url=os.getenv('S3_ENDPOINT', 'http://localhost:9000'),
            aws_access_key_id=os.getenv('S3_ACCESS_KEY'),
            aws_secret_access_key=os.getenv('S3_SECRET_KEY')
        )
        self.bucket = os.getenv('S3_BUCKET', 'news-images')
        
    async def save_image(self, image_data, file_path):
        """Upload to S3."""
        try:
            self.s3_client.put_object(
                Bucket=self.bucket,
                Key=file_path,
                Body=image_data,
                ContentType='image/jpeg'
            )
            return f"s3://{self.bucket}/{file_path}"
        except ClientError as e:
            logger.error(f"S3 upload failed: {e}")
            raise
```

**Cost Comparison:**
```
Local Storage (1TB SSD): $100-200 one-time
MinIO (self-hosted): Free + server costs
AWS S3 (1TB): ~$23/month
Backblaze B2 (1TB): ~$5/month (cheapest!)
```

---

### **Option 3: Hybrid Approach (Best of Both Worlds)**

**Strategy:**
1. Store recent images locally (last 30 days)
2. Archive old images to S3/B2
3. Keep database references to both

**Benefits:**
- ✅ Fast access to recent images
- ✅ Unlimited long-term storage
- ✅ Cost-effective

**Implementation:**
```python
# Archive old images (run daily)
import boto3
from datetime import datetime, timedelta

def archive_old_images():
    """Move images older than 30 days to S3."""
    cutoff_date = datetime.now() - timedelta(days=30)
    
    # Find old images
    for root, dirs, files in os.walk(IMAGE_DIR):
        for file in files:
            file_path = os.path.join(root, file)
            file_time = datetime.fromtimestamp(os.path.getmtime(file_path))
            
            if file_time < cutoff_date:
                # Upload to S3
                s3_key = file_path.replace(IMAGE_DIR, '').lstrip('/')
                s3_client.upload_file(file_path, 'news-archive', s3_key)
                
                # Update database
                await db.execute(
                    "UPDATE images SET storage_location = 'archive' WHERE file_path = $1",
                    file_path
                )
                
                # Delete local file
                os.remove(file_path)
                logger.info(f"Archived: {file_path}")
```

---

## 📝 Log Management

### **Problem: Logs Grow Indefinitely**

**Current Setup:**
```python
# logger_config.py
LOG_FILE = "logs/collector.log"  # ❌ Will grow forever!
```

**Without rotation:**
```
Day 1: 10 MB
Day 30: 300 MB
Day 365: 3.6 GB
Year 2: 7.2 GB  # ❌ Too large!
```

---

### **Solution 1: Python RotatingFileHandler (Built-in)**

```python
# logger_config.py
import logging
from logging.handlers import RotatingFileHandler
import os

LOG_DIR = os.getenv("LOG_DIR", "/var/log/news_osint")
os.makedirs(LOG_DIR, exist_ok=True)

# Create rotating file handler
file_handler = RotatingFileHandler(
    filename=os.path.join(LOG_DIR, 'collector.log'),
    maxBytes=10 * 1024 * 1024,  # 10 MB per file
    backupCount=10,              # Keep 10 old files
    encoding='utf-8'
)

# This creates:
# collector.log       (current)
# collector.log.1     (previous)
# collector.log.2     (older)
# ...
# collector.log.10    (oldest, then deleted)
```

**Result:**
- ✅ Max size: 10 files × 10 MB = 100 MB total
- ✅ Automatic rotation
- ✅ No manual intervention

---

### **Solution 2: TimedRotatingFileHandler (Daily Rotation)**

```python
from logging.handlers import TimedRotatingFileHandler

file_handler = TimedRotatingFileHandler(
    filename=os.path.join(LOG_DIR, 'collector.log'),
    when='midnight',      # Rotate at midnight
    interval=1,           # Every 1 day
    backupCount=30,       # Keep 30 days
    encoding='utf-8'
)

# This creates:
# collector.log                    (today)
# collector.log.2025-01-15         (yesterday)
# collector.log.2025-01-14         (2 days ago)
# ...
# collector.log.2024-12-17         (30 days ago, then deleted)
```

**Result:**
- ✅ One file per day
- ✅ Easy to find specific dates
- ✅ Automatic cleanup after 30 days

---

### **Solution 3: Logrotate (Linux Standard) - RECOMMENDED**

**Best for production!**

```bash
# /etc/logrotate.d/news_osint
/var/log/news_osint/*.log {
    daily                   # Rotate daily
    rotate 30               # Keep 30 days
    compress                # Compress old logs (gzip)
    delaycompress           # Don't compress yesterday's log
    missingok               # Don't error if log is missing
    notifempty              # Don't rotate if empty
    create 0644 www-data www-data
    sharedscripts
    postrotate
        # Reload application if needed
        systemctl reload news-collector || true
    endscript
}
```

**Result:**
```
/var/log/news_osint/
├── collector.log           (today, 10 MB)
├── collector.log.1         (yesterday, 10 MB)
├── collector.log.2.gz      (2 days ago, 2 MB compressed)
├── collector.log.3.gz      (3 days ago, 2 MB compressed)
...
└── collector.log.30.gz     (30 days ago, then deleted)

Total: ~70 MB (instead of 3.6 GB!)
```

**Setup:**
```bash
# Install logrotate (usually pre-installed)
sudo apt install logrotate

# Create config
sudo nano /etc/logrotate.d/news_osint

# Test
sudo logrotate -d /etc/logrotate.d/news_osint  # Dry run
sudo logrotate -f /etc/logrotate.d/news_osint  # Force rotation
```

---

### **Solution 4: Centralized Logging (Advanced)**

For multiple servers or advanced monitoring:

```bash
# Use Loki + Grafana
docker-compose.yml:
version: '3'
services:
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - ./loki-config.yaml:/etc/loki/config.yaml
      - loki-data:/loki

  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/log/news_osint:/var/log/news_osint
      - ./promtail-config.yaml:/etc/promtail/config.yaml

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
```

**Benefits:**
- ✅ Centralized log viewing
- ✅ Search across all logs
- ✅ Alerts on errors
- ✅ Beautiful dashboards

---

## 🚀 Recommended Production Setup

### **For Small-Medium Scale (<10K messages/day)**

```bash
# Directory structure
/var/www/news_osint/          # Application
/var/lib/news_osint/images/   # Images (local, date-organized)
/var/log/news_osint/          # Logs (logrotate managed)

# Disk allocation
Application: 1 GB
Images: 100 GB (expandable)
Logs: 1 GB (with rotation)
Database: 10 GB (PostgreSQL)
```

**Estimated Costs:**
- VPS: $10-20/month (2 CPU, 4GB RAM, 150GB SSD)
- Backups: $5/month (Backblaze B2)
- **Total: $15-25/month**

---

### **For Large Scale (>10K messages/day)**

```bash
# Directory structure
/var/www/news_osint/          # Application
/var/lib/news_osint/images/   # Recent images only (30 days)
s3://news-images/             # All images (S3/MinIO)
/var/log/news_osint/          # Logs (shipped to Loki)

# Disk allocation
Application: 1 GB
Recent Images: 20 GB
Logs: 1 GB
Database: 50 GB (PostgreSQL)
```

**Estimated Costs:**
- VPS: $40-80/month (4 CPU, 8GB RAM, 100GB SSD)
- S3 Storage: $5-10/month (Backblaze B2, 1TB)
- Database: $15/month (Managed PostgreSQL)
- **Total: $60-105/month**

---

## 📋 Production Checklist

### **File Storage**
- [ ] Move images to `/var/lib/news_osint/images/`
- [ ] Implement date-based organization
- [ ] Set up automatic archiving (if using S3)
- [ ] Configure backup strategy

### **Log Management**
- [ ] Update `logger_config.py` with `RotatingFileHandler`
- [ ] Set up logrotate configuration
- [ ] Test log rotation
- [ ] Set up log monitoring/alerts

### **Database**
- [ ] Use PostgreSQL (not SQLite)
- [ ] Set up automated backups
- [ ] Configure connection pooling
- [ ] Monitor disk usage

### **Security**
- [ ] Store `.env` in `/etc/news_osint/`
- [ ] Set proper file permissions (644 for files, 755 for dirs)
- [ ] Use systemd service (not screen/tmux)
- [ ] Set up firewall rules

### **Monitoring**
- [ ] Set up disk space alerts
- [ ] Monitor log file sizes
- [ ] Track database growth
- [ ] Monitor image storage usage

---

## 🎯 Summary

**Image Storage:**
- ✅ **Small scale:** Local storage with date organization
- ✅ **Large scale:** S3/MinIO for unlimited storage
- ✅ **Hybrid:** Local (30 days) + S3 (archive)

**Log Management:**
- ✅ **Best:** Logrotate (daily, 30 days, compressed)
- ✅ **Alternative:** Python RotatingFileHandler
- ✅ **Advanced:** Centralized logging (Loki/Grafana)

**Recommended Paths:**
```bash
Images:  /var/lib/news_osint/images/YYYY/MM/DD/channel/
Logs:    /var/log/news_osint/collector.log
Config:  /etc/news_osint/.env
App:     /var/www/news_osint/
```

Your production deployment will be solid! 🚀
