# PostgreSQL Migration Guide

## 🎯 Why PostgreSQL?

### **Benefits over SQLite:**

| Feature | SQLite | PostgreSQL |
|---------|--------|------------|
| **Concurrent Access** | Limited (file locking) | Excellent (MVCC) |
| **Performance** | Good for small data | Excellent for large data |
| **Full-Text Search** | Basic | Advanced (GIN indexes) |
| **Data Types** | Limited | Rich (JSONB, Arrays, etc.) |
| **Scalability** | Single file | Distributed possible |
| **Backup** | File copy | pg_dump, streaming |
| **Monitoring** | Limited | Extensive tools |
| **Production Ready** | Small apps | Enterprise grade |

---

## 📋 Prerequisites

### **1. Install PostgreSQL**

**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
# Or use Chocolatey
choco install postgresql

# Or use Docker
docker run --name postgres -e POSTGRES_PASSWORD=yourpassword -p 5432:5432 -d postgres:16
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS:**
```bash
brew install postgresql@16
brew services start postgresql@16
```

### **2. Create Database**

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE news_collection;

# Create user (optional)
CREATE USER news_collector WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE news_collection TO news_collector;

# Exit
\q
```

---

## 🔧 Installation Steps

### **Step 1: Install Python Dependencies**

```bash
cd news_collection
pip install -r requirements.txt
```

**New requirement:**
- `asyncpg>=0.29.0` (replaces `aiosqlite`)

### **Step 2: Configure Environment**

Update your `.env` file:

```bash
# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=news_collection
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_MIN_POOL_SIZE=10
DB_MAX_POOL_SIZE=20
```

### **Step 3: Initialize Schema**

```bash
# Option 1: Using psql
psql -U postgres -d news_collection -f schema_postgresql.sql

# Option 2: Let the collector initialize it
python collector.py
# It will automatically run schema_postgresql.sql on first run
```

### **Step 4: Update Code**

**Replace database.py:**
```bash
# Backup old file
mv database.py database_sqlite.py

# Use PostgreSQL version
mv database_postgresql.py database.py
```

---

## 🔄 Migrating Existing Data

### **Option 1: Start Fresh (Recommended)**

```bash
# Just run the collector with new PostgreSQL database
python collector.py
```

**Pros:**
- Clean start
- No migration issues
- Faster

**Cons:**
- Lose historical data

### **Option 2: Migrate SQLite Data**

Create a migration script:

```python
# migrate_to_postgres.py
import sqlite3
import asyncio
import asyncpg
from config import Config

async def migrate():
    # Connect to SQLite
    sqlite_conn = sqlite3.connect('data/news_collection.db')
    sqlite_conn.row_factory = sqlite3.Row
    
    # Connect to PostgreSQL
    pg_conn = await asyncpg.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        database=Config.DB_NAME,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD
    )
    
    try:
        # Migrate channels
        print("Migrating channels...")
        cursor = sqlite_conn.cursor()
        cursor.execute("SELECT * FROM channels")
        channels = cursor.fetchall()
        
        for channel in channels:
            await pg_conn.execute(
                """INSERT INTO channels 
                   (telegram_channel_id, name, display_name, category, last_fetched_datetime)
                   VALUES ($1, $2, $3, $4, $5)
                   ON CONFLICT DO NOTHING""",
                channel['telegram_channel_id'], channel['name'], 
                channel['display_name'], channel['category'],
                channel['last_fetched_datetime']
            )
        print(f"Migrated {len(channels)} channels")
        
        # Migrate messages
        print("Migrating messages...")
        cursor.execute("SELECT * FROM messages")
        batch = []
        count = 0
        
        while True:
            rows = cursor.fetchmany(1000)
            if not rows:
                break
                
            for row in rows:
                batch.append((
                    row['channel_id'], row['message_id'], row['message_text'],
                    row['message_datetime'], row['has_media'], row['is_duplicate'],
                    row.get('is_forwarded', 0),
                    row.get('duplicate_of_channel_id'), row.get('duplicate_of_message_id'),
                    row.get('forward_from_channel_id'), row.get('forward_from_message_id'),
                    row.get('text_hash'), row.get('grouped_id')
                ))
                
                if len(batch) >= 1000:
                    await pg_conn.executemany(
                        """INSERT INTO messages 
                           (channel_id, message_id, message_text, message_datetime,
                            has_media, is_duplicate, is_forwarded, 
                            duplicate_of_channel_id, duplicate_of_message_id,
                            forward_from_channel_id, forward_from_message_id,
                            text_hash, grouped_id)
                           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                           ON CONFLICT DO NOTHING""",
                        batch
                    )
                    count += len(batch)
                    print(f"Migrated {count} messages...")
                    batch = []
        
        if batch:
            await pg_conn.executemany(
                """INSERT INTO messages 
                   (channel_id, message_id, message_text, message_datetime,
                    has_media, is_duplicate, is_forwarded,
                    duplicate_of_channel_id, duplicate_of_message_id,
                    forward_from_channel_id, forward_from_message_id,
                    text_hash, grouped_id)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                   ON CONFLICT DO NOTHING""",
                batch
            )
            count += len(batch)
        
        print(f"Total migrated: {count} messages")
        
        # Migrate images
        print("Migrating images...")
        cursor.execute("SELECT * FROM images")
        images = cursor.fetchall()
        
        for img in images:
            await pg_conn.execute(
                """INSERT INTO images 
                   (message_channel_id, message_message_id, file_id, file_path,
                    original_size, compressed_size, width, height)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                   ON CONFLICT DO NOTHING""",
                img['message_channel_id'], img['message_message_id'],
                img['file_id'], img['file_path'],
                img['original_size'], img['compressed_size'],
                img['width'], img['height']
            )
        print(f"Migrated {len(images)} images")
        
        print("\n✅ Migration complete!")
        
    finally:
        sqlite_conn.close()
        await pg_conn.close()

if __name__ == '__main__':
    asyncio.run(migrate())
```

**Run migration:**
```bash
python migrate_to_postgres.py
```

---

## 🎯 Key Differences

### **1. Connection**

**SQLite:**
```python
import aiosqlite
conn = await aiosqlite.connect('database.db')
```

**PostgreSQL:**
```python
import asyncpg
pool = await asyncpg.create_pool(
    host='localhost',
    database='news_collection',
    user='postgres',
    password='password'
)
```

### **2. Placeholders**

**SQLite:**
```sql
SELECT * FROM messages WHERE id = ?
```

**PostgreSQL:**
```sql
SELECT * FROM messages WHERE id = $1
```

### **3. Data Types**

**SQLite:**
```sql
INTEGER, TEXT, REAL, BLOB
```

**PostgreSQL:**
```sql
BIGINT, TEXT, TIMESTAMP WITH TIME ZONE, BYTEA, JSONB, ARRAY
```

### **4. Auto-increment**

**SQLite:**
```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
```

**PostgreSQL:**
```sql
id SERIAL PRIMARY KEY
-- or
id BIGSERIAL PRIMARY KEY
```

---

## 📊 Performance Tuning

### **1. Connection Pool**

```python
# config.py
DB_MIN_POOL_SIZE = 10  # Minimum connections
DB_MAX_POOL_SIZE = 20  # Maximum connections
```

**Guidelines:**
- Small app: 5-10 connections
- Medium app: 10-20 connections
- Large app: 20-50 connections

### **2. Indexes**

```sql
-- Already created in schema
CREATE INDEX idx_messages_datetime ON messages(message_datetime);
CREATE INDEX idx_messages_text_hash ON messages(text_hash);

-- Full-text search
CREATE INDEX idx_messages_text_fts ON messages 
USING GIN(to_tsvector('english', COALESCE(message_text, '')));
```

### **3. PostgreSQL Configuration**

Edit `postgresql.conf`:

```ini
# Memory
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 16MB

# Connections
max_connections = 100

# Performance
random_page_cost = 1.1  # For SSD
```

---

## 🔍 Monitoring

### **1. Check Connection Pool**

```python
print(f"Pool size: {pool.get_size()}")
print(f"Free connections: {pool.get_idle_size()}")
```

### **2. Query Performance**

```sql
-- Enable query logging
ALTER DATABASE news_collection SET log_statement = 'all';

-- Check slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### **3. Database Size**

```sql
SELECT pg_size_pretty(pg_database_size('news_collection'));
```

---

## 🛡️ Backup & Restore

### **Backup**

```bash
# Full backup
pg_dump -U postgres news_collection > backup.sql

# Compressed backup
pg_dump -U postgres news_collection | gzip > backup.sql.gz

# Custom format (faster restore)
pg_dump -U postgres -Fc news_collection > backup.dump
```

### **Restore**

```bash
# From SQL file
psql -U postgres news_collection < backup.sql

# From compressed
gunzip -c backup.sql.gz | psql -U postgres news_collection

# From custom format
pg_restore -U postgres -d news_collection backup.dump
```

### **Automated Backups**

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U postgres news_collection | gzip > backups/backup_$DATE.sql.gz
# Keep only last 7 days
find backups/ -name "backup_*.sql.gz" -mtime +7 -delete
EOF

chmod +x backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /path/to/backup.sh
```

---

## ✅ Verification

### **1. Check Tables**

```sql
\dt  -- List tables
\d messages  -- Describe messages table
```

### **2. Check Data**

```sql
SELECT COUNT(*) FROM channels;
SELECT COUNT(*) FROM messages;
SELECT COUNT(*) FROM images;
```

### **3. Test Queries**

```sql
-- Test full-text search
SELECT * FROM messages 
WHERE to_tsvector('english', message_text) @@ to_tsquery('news & breaking')
LIMIT 10;

-- Test performance
EXPLAIN ANALYZE
SELECT * FROM messages 
WHERE channel_id = 1234567890 
ORDER BY message_datetime DESC 
LIMIT 100;
```

---

## 🎉 Summary

**Migration Checklist:**
- ✅ Install PostgreSQL
- ✅ Create database
- ✅ Update `.env` with PostgreSQL credentials
- ✅ Install `asyncpg` package
- ✅ Replace `database.py` with PostgreSQL version
- ✅ Run schema initialization
- ✅ Migrate data (optional)
- ✅ Test collector
- ✅ Setup backups

**Benefits:**
- ✅ Better performance
- ✅ Concurrent access
- ✅ Advanced full-text search
- ✅ Production-ready
- ✅ Better monitoring
- ✅ Scalable

You're now ready for production! 🚀
