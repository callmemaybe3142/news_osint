# Media Group (Album) Support - CORRECTED Implementation

## 🐛 Issue Identified (Corrected)

You were absolutely right! I initially misunderstood how Telegram handles media groups.

### ❌ My Initial Wrong Understanding:
- I thought all photos in an album share the same `message_id`
- I tried to link all photos to a single message

### ✅ Correct Understanding (Thanks to your screenshots):
- **Each photo in an album has its OWN unique `message_id`**
- Photos in an album are linked by a shared `grouped_id`
- Example from your DGF21News channel:
  ```
  Message ID 116490 - Photo 1 - grouped_id: 6197332986169068370
  Message ID 116491 - Photo 2 - grouped_id: 6197332986169068370
  Message ID 116492 - Photo 3 - grouped_id: 6197332986169068370
  Message ID 116493 - Photo 4 - grouped_id: 6197332986169068370
  Message ID 116494 - Photo 5 - grouped_id: 6197332986169068370
  ```

## ✅ Correct Implementation

### Database Schema Changes

**Added `grouped_id` column to `messages` table:**

```sql
CREATE TABLE messages (
    channel_id INTEGER NOT NULL,
    message_id INTEGER NOT NULL,
    message_text TEXT,
    message_datetime TEXT NOT NULL,
    has_media INTEGER DEFAULT 0,
    is_duplicate INTEGER DEFAULT 0,
    original_channel_id INTEGER,
    original_message_id INTEGER,
    text_hash TEXT,
    grouped_id INTEGER,  -- NEW: Telegram's grouped_id for albums
    created_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (channel_id, message_id)
);

CREATE INDEX idx_messages_grouped_id ON messages(grouped_id);
```

### How It Works Now

1. **Each photo gets its own message entry:**
   ```python
   # Message 116490 (Photo 1)
   {
       'channel_id': 1,
       'message_id': 116490,
       'message_text': 'Caption text here',
       'grouped_id': 6197332986169068370,
       'has_media': 1
   }
   
   # Message 116491 (Photo 2)
   {
       'channel_id': 1,
       'message_id': 116491,
       'message_text': '',  # Usually empty for subsequent photos
       'grouped_id': 6197332986169068370,
       'has_media': 1
   }
   # ... and so on for all 5 photos
   ```

2. **Each photo gets its own image entry:**
   ```python
   # Image for message 116490
   {
       'message_channel_id': 1,
       'message_message_id': 116490,  # Links to its own message
       'file_id': '6197332986169068364',
       'file_path': 'dgf21news/6197332986169068364.jpg'
   }
   
   # Image for message 116491
   {
       'message_channel_id': 1,
       'message_message_id': 116491,  # Links to its own message
       'file_id': '6197332986169068365',
       'file_path': 'dgf21news/6197332986169068365.jpg'
   }
   # ... and so on
   ```

3. **Finding all photos in an album:**
   ```sql
   -- Get all messages in the same album
   SELECT * FROM messages 
   WHERE grouped_id = 6197332986169068370
   ORDER BY message_id;
   
   -- Get all images in the same album
   SELECT i.* 
   FROM images i
   JOIN messages m ON i.message_message_id = m.message_id
   WHERE m.grouped_id = 6197332986169068370
   ORDER BY m.message_id;
   ```

## 📊 Database Structure Example

### Messages Table:
| channel_id | message_id | message_text | grouped_id | has_media |
|------------|------------|--------------|------------|-----------|
| 1 | 116490 | "ကောင်းမွန်သော..." | 6197332986169068370 | 1 |
| 1 | 116491 | "" | 6197332986169068370 | 1 |
| 1 | 116492 | "" | 6197332986169068370 | 1 |
| 1 | 116493 | "" | 6197332986169068370 | 1 |
| 1 | 116494 | "" | 6197332986169068370 | 1 |

### Images Table:
| id | message_message_id | file_id | file_path |
|----|-------------------|---------|-----------|
| 1 | 116490 | 6197332986169068364 | dgf21news/...364.jpg |
| 2 | 116491 | 6197332986169068365 | dgf21news/...365.jpg |
| 3 | 116492 | 6197332986169068366 | dgf21news/...366.jpg |
| 4 | 116493 | 6197332986169068367 | dgf21news/...367.jpg |
| 5 | 116494 | 6197332986169068368 | dgf21news/...368.jpg |

## 🔧 Code Changes

### 1. Schema (schema.sql)
- ✅ Added `grouped_id INTEGER` column to messages table
- ✅ Added index on `grouped_id` for fast queries

### 2. Database (database.py)
- ✅ Added `grouped_id` parameter to `insert_message()`
- ✅ Added `grouped_id` parameter to `bulk_insert_messages()`

### 3. Collector (collector.py)
- ✅ Removed `process_media_group()` method (not needed!)
- ✅ Updated `process_message()` to store `grouped_id`
- ✅ Each photo message is processed individually with its own `message_id`
- ✅ `grouped_id` is automatically captured from Telegram message

### 4. Viewer (database_reader.py)
- ✅ Added `grouped_id` to message queries
- ✅ Can now display which messages are part of the same album

## 🎯 How Collection Works Now

```python
# When collector encounters a message:
async for message in client.iter_messages(channel):
    # Message 116490 (first photo in album)
    process_message(message)  # Stores: message_id=116490, grouped_id=6197...
    
    # Message 116491 (second photo in album)
    process_message(message)  # Stores: message_id=116491, grouped_id=6197...
    
    # Message 116492 (third photo in album)
    process_message(message)  # Stores: message_id=116492, grouped_id=6197...
    
    # ... and so on
```

**Key Point**: Telegram's `iter_messages()` already gives us each photo as a separate message! We just need to store the `grouped_id` to know they're related.

## 📝 Useful Queries

### Find all albums (messages with same grouped_id):
```sql
SELECT 
    grouped_id,
    COUNT(*) as photo_count,
    MIN(message_id) as first_message_id,
    MAX(message_text) as caption
FROM messages
WHERE grouped_id IS NOT NULL
GROUP BY grouped_id
HAVING photo_count > 1
ORDER BY photo_count DESC;
```

### Get all photos from a specific album:
```sql
SELECT 
    m.message_id,
    m.message_text,
    i.file_path,
    i.width,
    i.height
FROM messages m
JOIN images i ON m.message_id = i.message_message_id
WHERE m.grouped_id = 6197332986169068370
ORDER BY m.message_id;
```

### Find messages that are part of albums:
```sql
SELECT 
    c.display_name,
    m.message_id,
    m.grouped_id,
    m.message_text
FROM messages m
JOIN channels c ON m.channel_id = c.id
WHERE m.grouped_id IS NOT NULL
ORDER BY m.grouped_id, m.message_id;
```

## ✅ What's Fixed

- ✅ **Each photo has its own `message_id`** (correct!)
- ✅ **Photos in albums linked by `grouped_id`** (correct!)
- ✅ **All photos in an album are collected** (works automatically!)
- ✅ **Database schema updated** with `grouped_id` column
- ✅ **Collector simplified** (no special media group handling needed!)
- ✅ **Viewer updated** to show `grouped_id`

## 🧪 Testing

1. **Run the collector:**
   ```bash
   cd news_collection
   python collector.py
   ```

2. **Check for albums in database:**
   ```bash
   sqlite3 data/news_collection.db
   
   -- Find albums
   SELECT grouped_id, COUNT(*) as count 
   FROM messages 
   WHERE grouped_id IS NOT NULL 
   GROUP BY grouped_id 
   HAVING count > 1;
   ```

3. **Verify in viewer:**
   ```bash
   cd news_viewer
   python viewer.py
   ```
   - Messages with the same `grouped_id` are part of the same album
   - Each message will show its own image

## 🎉 Summary

The implementation is now **CORRECT**:

1. **Each photo = separate message** with unique `message_id`
2. **Album photos linked** by shared `grouped_id`
3. **No special handling needed** - Telegram already separates them!
4. **Database properly tracks** both individual messages and album relationships

Thank you for catching this! Your screenshots made it crystal clear how Telegram actually structures media groups. 🙏
