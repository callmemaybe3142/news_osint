# Schema Refactoring - Using Telegram Channel IDs Directly

## 🎯 Overview

The database schema has been refactored to use **Telegram channel IDs directly** as primary keys, eliminating the need for an autoincrement ID column. This simplifies the schema and makes it more intuitive.

---

## ✅ What Changed

### **1. Channels Table - Simplified Primary Key**

#### **Before:**
```sql
CREATE TABLE channels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,      -- Autoincrement ID
    telegram_channel_id INTEGER UNIQUE,        -- Telegram's actual ID
    name TEXT NOT NULL UNIQUE,
    ...
);
```

#### **After:**
```sql
CREATE TABLE channels (
    telegram_channel_id INTEGER PRIMARY KEY,   -- Telegram ID is now the PK!
    name TEXT NOT NULL UNIQUE,
    display_name TEXT,
    category TEXT,
    last_fetched_datetime TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);
```

**Benefits:**
- ✅ No more autoincrement ID
- ✅ Telegram channel ID is the authoritative identifier
- ✅ Simpler foreign key relationships
- ✅ One less column to manage

---

### **2. Messages Table - Renamed Duplicate Tracking Columns**

#### **Column Name Changes:**
```sql
-- OLD (confusing names)
original_channel_id INTEGER
original_message_id INTEGER

-- NEW (clearer purpose)
duplicate_of_channel_id INTEGER
duplicate_of_message_id INTEGER
```

**Why?**
- `original_*` was confusing - it sounded like it was for forwarded messages
- `duplicate_of_*` clearly indicates this is for **duplicate text detection**
- Forwarded messages use `forward_from_*` columns

#### **Complete Messages Table:**
```sql
CREATE TABLE messages (
    channel_id INTEGER NOT NULL,               -- Telegram channel ID
    message_id INTEGER NOT NULL,               -- Telegram message ID
    message_text TEXT,
    message_datetime TEXT NOT NULL,
    has_media INTEGER DEFAULT 0,
    is_duplicate INTEGER DEFAULT 0,
    is_forwarded INTEGER DEFAULT 0,
    duplicate_of_channel_id INTEGER,           -- NEW: Channel ID of original (if duplicate)
    duplicate_of_message_id INTEGER,           -- NEW: Message ID of original (if duplicate)
    forward_from_channel_id INTEGER,           -- Forwarded source channel ID
    forward_from_message_id INTEGER,           -- Forwarded source message ID
    text_hash TEXT,
    grouped_id INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    
    PRIMARY KEY (channel_id, message_id),
    FOREIGN KEY (channel_id) REFERENCES channels(telegram_channel_id) ON DELETE CASCADE,
    FOREIGN KEY (duplicate_of_channel_id, duplicate_of_message_id) 
        REFERENCES messages(channel_id, message_id) ON DELETE SET NULL
);
```

---

## 📊 Understanding the Columns

### **Duplicate Detection (duplicate_of_*)**

**Purpose:** Track when the same text appears in multiple messages

**Example:**
```sql
-- Original message
channel_id: 1234567890
message_id: 100
message_text: "Breaking news about..."
is_duplicate: 0
duplicate_of_channel_id: NULL
duplicate_of_message_id: NULL

-- Duplicate message (same text, different channel)
channel_id: 9876543210
message_id: 200
message_text: NULL  (not stored - saves space)
is_duplicate: 1
duplicate_of_channel_id: 1234567890  (points to original)
duplicate_of_message_id: 100         (points to original)
```

**Query to find duplicates:**
```sql
SELECT 
    m1.channel_id as duplicate_channel,
    m1.message_id as duplicate_message,
    m1.duplicate_of_channel_id as original_channel,
    m1.duplicate_of_message_id as original_message,
    m2.message_text as original_text
FROM messages m1
JOIN messages m2 ON m1.duplicate_of_channel_id = m2.channel_id 
                 AND m1.duplicate_of_message_id = m2.message_id
WHERE m1.is_duplicate = 1;
```

---

### **Forwarded Messages (forward_from_*)**

**Purpose:** Track the original source of forwarded messages

**Example:**
```sql
-- Forwarded message
channel_id: 1234567890
message_id: 300
message_text: NULL  (not stored for forwards)
is_forwarded: 1
forward_from_channel_id: 5555555555  (original channel)
forward_from_message_id: 789         (original message)
```

**Query to find forwards:**
```sql
SELECT 
    channel_id,
    message_id,
    forward_from_channel_id,
    forward_from_message_id
FROM messages
WHERE is_forwarded = 1;
```

---

## 🔄 Migration from Old Schema

If you have an existing database with the old schema, you have two options:

### **Option 1: Start Fresh (Recommended)**

```bash
# Backup old database
mv data/news_collection.db data/news_collection.db.backup

# Run collector to create new schema
cd news_collection
python collector.py
```

### **Option 2: Migrate Existing Data**

```sql
-- Step 1: Create new channels table
CREATE TABLE channels_new (
    telegram_channel_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT,
    category TEXT,
    last_fetched_datetime TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Step 2: Copy data from old table
INSERT INTO channels_new (telegram_channel_id, name, display_name, category, last_fetched_datetime, created_at)
SELECT telegram_channel_id, name, display_name, category, last_fetched_datetime, created_at
FROM channels
WHERE telegram_channel_id IS NOT NULL;

-- Step 3: Create new messages table
CREATE TABLE messages_new (
    channel_id INTEGER NOT NULL,
    message_id INTEGER NOT NULL,
    message_text TEXT,
    message_datetime TEXT NOT NULL,
    has_media INTEGER DEFAULT 0,
    is_duplicate INTEGER DEFAULT 0,
    is_forwarded INTEGER DEFAULT 0,
    duplicate_of_channel_id INTEGER,
    duplicate_of_message_id INTEGER,
    forward_from_channel_id INTEGER,
    forward_from_message_id INTEGER,
    text_hash TEXT,
    grouped_id INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (channel_id, message_id),
    FOREIGN KEY (channel_id) REFERENCES channels_new(telegram_channel_id) ON DELETE CASCADE
);

-- Step 4: Copy messages data
INSERT INTO messages_new 
SELECT 
    (SELECT telegram_channel_id FROM channels WHERE id = m.channel_id) as channel_id,
    m.message_id,
    m.message_text,
    m.message_datetime,
    m.has_media,
    m.is_duplicate,
    COALESCE(m.is_forwarded, 0) as is_forwarded,
    (SELECT telegram_channel_id FROM channels WHERE id = m.original_channel_id) as duplicate_of_channel_id,
    m.original_message_id as duplicate_of_message_id,
    m.forward_from_channel_id,
    m.forward_from_message_id,
    m.text_hash,
    m.grouped_id,
    m.created_at
FROM messages m;

-- Step 5: Drop old tables
DROP TABLE messages;
DROP TABLE channels;

-- Step 6: Rename new tables
ALTER TABLE channels_new RENAME TO channels;
ALTER TABLE messages_new RENAME TO messages;

-- Step 7: Recreate indexes
CREATE INDEX idx_channels_name ON channels(name);
CREATE INDEX idx_messages_text_hash ON messages(text_hash);
CREATE INDEX idx_messages_datetime ON messages(message_datetime);
CREATE INDEX idx_messages_has_media ON messages(has_media);
CREATE INDEX idx_messages_is_duplicate ON messages(is_duplicate);
CREATE INDEX idx_messages_is_forwarded ON messages(is_forwarded);
CREATE INDEX idx_messages_duplicate_of ON messages(duplicate_of_channel_id, duplicate_of_message_id);
CREATE INDEX idx_messages_grouped_id ON messages(grouped_id);
CREATE INDEX idx_messages_forward_from ON messages(forward_from_channel_id, forward_from_message_id);
```

---

## 🎯 Key Takeaways

### **1. Telegram Channel IDs are Now Primary Keys**
```python
# When adding a channel
await db.add_channel(
    name='nugmyanmar',
    telegram_channel_id=1234567890,  # This is now the PK!
    display_name='NUG Myanmar'
)

# When querying
channel_id = 1234567890  # Use Telegram ID directly
```

### **2. Duplicate vs Forward - Clear Distinction**

| Feature | Duplicate Detection | Forwarded Messages |
|---------|-------------------|-------------------|
| **Purpose** | Same text in different messages | Message forwarded from another channel |
| **Columns** | `duplicate_of_channel_id`, `duplicate_of_message_id` | `forward_from_channel_id`, `forward_from_message_id` |
| **Flag** | `is_duplicate = 1` | `is_forwarded = 1` |
| **Text Storage** | NULL (saves space) | NULL (saves space) |
| **Use Case** | Find copy-paste spam | Track original source |

### **3. Simplified Foreign Keys**
```sql
-- Before
FOREIGN KEY (channel_id) REFERENCES channels(id)

-- After
FOREIGN KEY (channel_id) REFERENCES channels(telegram_channel_id)
```

---

## 🧪 Testing the New Schema

### **1. Add a Channel:**
```bash
cd news_collection
python manage_db.py
# Choose option 1, add a channel
```

**Verify:**
```sql
SELECT * FROM channels;
-- telegram_channel_id should be the primary key
```

### **2. Collect Messages:**
```bash
python collector.py
```

**Verify:**
```sql
-- Check that channel_id matches telegram_channel_id
SELECT DISTINCT m.channel_id, c.telegram_channel_id
FROM messages m
JOIN channels c ON m.channel_id = c.telegram_channel_id;
```

### **3. Check Duplicates:**
```sql
SELECT 
    channel_id,
    message_id,
    is_duplicate,
    duplicate_of_channel_id,
    duplicate_of_message_id
FROM messages
WHERE is_duplicate = 1
LIMIT 5;
```

### **4. Check Forwards:**
```sql
SELECT 
    channel_id,
    message_id,
    is_forwarded,
    forward_from_channel_id,
    forward_from_message_id
FROM messages
WHERE is_forwarded = 1
LIMIT 5;
```

---

## ✅ Files Updated

1. ✅ `schema.sql` - Refactored channels and messages tables
2. ✅ `database.py` - Updated all queries to use telegram_channel_id
3. ✅ `collector.py` - Updated to use duplicate_of_* columns
4. ✅ `manage_db.py` - Updated channel management
5. ✅ `database_reader.py` - Updated viewer queries
6. ✅ `viewer.py` - Updated duplicate display

---

## 🎉 Summary

✅ **Channels table** now uses `telegram_channel_id` as primary key
✅ **No more autoincrement ID** - simpler schema
✅ **Renamed columns** for clarity:
   - `original_*` → `duplicate_of_*` (for duplicate text)
   - `forward_from_*` (for forwarded messages)
✅ **All foreign keys updated** to reference telegram_channel_id
✅ **Collector, database, and viewer** all updated

The schema is now cleaner, more intuitive, and uses Telegram's native IDs throughout! 🚀
