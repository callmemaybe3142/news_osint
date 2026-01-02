# PostgreSQL Migration - Complete Checklist

## ✅ Files Updated

### **Collector (news_collection/)**

| File | Status | Changes |
|------|--------|---------|
| `schema_postgresql.sql` | ✅ Created | PostgreSQL schema with proper data types |
| `database_postgresql.py` | ✅ Created | PostgreSQL database operations using asyncpg |
| `requirements.txt` | ✅ Updated | Changed `aiosqlite` → `asyncpg` |
| `config.py` | ✅ Updated | Added PostgreSQL connection parameters |
| `.env.example` | ✅ Updated | Added PostgreSQL configuration |
| `manage_db.py` | ✅ Compatible | Already uses `database.py` abstraction |
| `collector.py` | ✅ Compatible | Already uses `database.py` abstraction |
| `image_handler.py` | ✅ Compatible | No database-specific code |

### **Viewer (news_viewer/)**

| File | Status | Changes |
|------|--------|---------|
| `database_reader_postgresql.py` | ✅ Created | PostgreSQL reader with async + sync wrapper |
| `config.py` | ✅ Updated | Changed `DATABASE_PATH` → `DB_CONFIG` |
| `requirements.txt` | ✅ Updated | Added `asyncpg` and `python-dotenv` |
| `viewer.py` | ⚠️ Needs Update | Must use new database_reader |

---

## 🔧 Migration Steps

### **Step 1: Install PostgreSQL**

**Option A: Docker (Recommended for Development)**
```bash
docker run --name postgres \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=news_collection \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  -d postgres:16
```

**Option B: Native Installation**
- Windows: Download from https://www.postgresql.org/download/windows/
- Linux: `sudo apt install postgresql postgresql-contrib`
- macOS: `brew install postgresql@16`

### **Step 2: Create Database**

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE news_collection;

# Create user (optional but recommended)
CREATE USER news_collector WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE news_collection TO news_collector;

# Grant schema permissions
\c news_collection
GRANT ALL ON SCHEMA public TO news_collector;
GRANT ALL ON ALL TABLES IN SCHEMA public TO news_collector;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO news_collector;

# Exit
\q
```

### **Step 3: Update Environment Variables**

Create/update `.env` file in `news_collection/`:

```bash
# Telegram API Credentials
API_ID=your_api_id
API_HASH=your_api_hash
SESSION_STRING=your_session_string

# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=news_collection
DB_USER=news_collector
DB_PASSWORD=secure_password_here
DB_MIN_POOL_SIZE=10
DB_MAX_POOL_SIZE=20

# Collection Settings
START_DATE=2025-05-01T00:00:00Z
MIN_TEXT_LENGTH=50

# Image Settings
IMAGE_DIR=images
MAX_IMAGE_WIDTH=1280
IMAGE_QUALITY=75

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/collector.log
```

**Also create `.env` in `news_viewer/`** (or it will use the one from news_collection):

```bash
# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=news_collection
DB_USER=news_collector
DB_PASSWORD=secure_password_here
```

### **Step 4: Install Python Dependencies**

```bash
# Collector
cd news_collection
pip install -r requirements.txt

# Viewer
cd ../news_viewer
pip install -r requirements.txt
```

### **Step 5: Replace Database Files**

```bash
# In news_collection/
mv database.py database_sqlite.py  # Backup old file
mv database_postgresql.py database.py  # Use PostgreSQL version

# In news_viewer/
mv database_reader.py database_reader_sqlite.py  # Backup old file
mv database_reader_postgresql.py database_reader.py  # Use PostgreSQL version
```

### **Step 6: Initialize Schema**

**Option A: Using psql**
```bash
cd news_collection
psql -U news_collector -d news_collection -f schema_postgresql.sql
```

**Option B: Let the collector do it**
```bash
cd news_collection
python collector.py
# It will automatically run schema_postgresql.sql on first connection
```

### **Step 7: Update Viewer**

The viewer needs a small update to use the new database_reader. Update `viewer.py`:

```python
# Change this line:
from database_reader import DatabaseReader

# To:
from database_reader import SyncDatabaseReader as DatabaseReader

# And update initialization:
# Change:
self.db = DatabaseReader(config.DATABASE_PATH)

# To:
self.db = DatabaseReader(config.DB_CONFIG)
```

### **Step 8: Test Everything**

```bash
# Test collector
cd news_collection
python manage_db.py list-channels

# Add a channel
python manage_db.py
# Choose option 1, add a channel

# Run collector
python collector.py

# Test viewer
cd ../news_viewer
python viewer.py
```

---

## 🔍 Verification

### **1. Check Database Connection**

```bash
psql -U news_collector -d news_collection

# List tables
\dt

# Check data
SELECT COUNT(*) FROM channels;
SELECT COUNT(*) FROM messages;
SELECT COUNT(*) FROM images;

# Exit
\q
```

### **2. Check Schema**

```sql
-- Verify tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should show:
-- channels
-- messages
-- images
-- exclusion_rules

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public';
```

### **3. Test Queries**

```sql
-- Test full-text search
SELECT * FROM messages 
WHERE to_tsvector('english', COALESCE(message_text, '')) @@ to_tsquery('news')
LIMIT 10;

-- Test joins
SELECT 
    c.name,
    COUNT(m.message_id) as message_count
FROM channels c
LEFT JOIN messages m ON c.telegram_channel_id = m.channel_id
GROUP BY c.telegram_channel_id, c.name;

-- Test performance
EXPLAIN ANALYZE
SELECT * FROM messages 
WHERE channel_id = 1234567890 
ORDER BY message_datetime DESC 
LIMIT 100;
```

---

## 📊 Performance Monitoring

### **1. Connection Pool Stats**

Add to your code:

```python
# In collector.py or manage_db.py
async def check_pool_stats():
    print(f"Pool size: {db.pool.get_size()}")
    print(f"Free connections: {db.pool.get_idle_size()}")
```

### **2. Query Performance**

```sql
-- Enable pg_stat_statements extension
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- View slow queries
SELECT 
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### **3. Database Size**

```sql
-- Database size
SELECT pg_size_pretty(pg_database_size('news_collection'));

-- Table sizes
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🛡️ Backup Strategy

### **1. Automated Daily Backups**

Create `backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="news_collection"
DB_USER="news_collector"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup database
pg_dump -U $DB_USER -Fc $DB_NAME > "$BACKUP_DIR/backup_$DATE.dump"

# Keep only last 7 days
find "$BACKUP_DIR" -name "backup_*.dump" -mtime +7 -delete

echo "Backup completed: backup_$DATE.dump"
```

Make it executable and add to cron:

```bash
chmod +x backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /path/to/backup.sh
```

### **2. Restore from Backup**

```bash
# Restore from custom format
pg_restore -U news_collector -d news_collection -c backup_20251216.dump

# Or from SQL dump
psql -U news_collector -d news_collection < backup_20251216.sql
```

---

## 🚨 Troubleshooting

### **Issue: Connection Refused**

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
# Or
docker ps  # If using Docker

# Check if port is open
netstat -an | grep 5432
```

**Solution:**
```bash
# Start PostgreSQL
sudo systemctl start postgresql  # Linux
# Or
docker start postgres  # Docker
```

### **Issue: Authentication Failed**

**Solution:**
1. Check `.env` file has correct password
2. Verify user exists:
   ```sql
   \du  -- List users
   ```
3. Check `pg_hba.conf` allows password authentication

### **Issue: Permission Denied**

**Solution:**
```sql
-- Grant all permissions
GRANT ALL PRIVILEGES ON DATABASE news_collection TO news_collector;
\c news_collection
GRANT ALL ON SCHEMA public TO news_collector;
GRANT ALL ON ALL TABLES IN SCHEMA public TO news_collector;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO news_collector;
```

### **Issue: Pool Exhausted**

**Solution:**
Increase pool size in `.env`:
```bash
DB_MAX_POOL_SIZE=50  # Increase from 20
```

---

## ✅ Final Checklist

- [ ] PostgreSQL installed and running
- [ ] Database `news_collection` created
- [ ] User `news_collector` created with permissions
- [ ] `.env` file updated with PostgreSQL credentials
- [ ] Python dependencies installed (`asyncpg`)
- [ ] `database.py` replaced with PostgreSQL version
- [ ] `database_reader.py` replaced with PostgreSQL version
- [ ] Schema initialized (`schema_postgresql.sql`)
- [ ] Viewer updated to use new database_reader
- [ ] Collector tested successfully
- [ ] Viewer tested successfully
- [ ] Backup strategy implemented

---

## 🎉 You're Done!

Your system is now running on PostgreSQL with:
- ✅ Better performance
- ✅ Concurrent access support
- ✅ Advanced full-text search
- ✅ Production-ready reliability
- ✅ Better monitoring capabilities
- ✅ Scalability for millions of messages

**Next Steps:**
1. Run the collector to start collecting data
2. Monitor performance using pg_stat_statements
3. Set up automated backups
4. Consider setting up replication for high availability

Welcome to production-grade OSINT! 🚀
