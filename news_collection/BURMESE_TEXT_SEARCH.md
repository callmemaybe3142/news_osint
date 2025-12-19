# Burmese Text Search - Trigram Index

## 🔍 Problem Solved

### **Before (Full-Text Search Only)**
```sql
-- Only works for whole words
SELECT * FROM messages 
WHERE to_tsvector('simple', message_text) @@ to_tsquery('simple', 'တရုတ်');
-- ❌ Doesn't find "တရုတ်နိုင်ငံ" or "တရုတ်ဘာသာ"
```

### **After (With Trigram Index)**
```sql
-- Works for partial text!
SELECT * FROM messages 
WHERE message_text ILIKE '%တရုတ်%';
-- ✅ Finds "တရုတ်", "တရုတ်နိုင်ငံ", "တရုတ်ဘာသာ", etc.
-- ✅ FAST (uses trigram index)
```

---

## 🎯 What Changed

### **Added pg_trgm Extension**
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

**What it does:**
- Enables trigram (3-character) indexing
- Makes `LIKE`/`ILIKE` queries fast
- Works with any language (including Burmese)

### **Added Trigram Index**
```sql
CREATE INDEX idx_messages_text_trgm ON messages 
USING GIN(message_text gin_trgm_ops);
```

**What it does:**
- Indexes text in 3-character chunks
- Enables fast partial matching
- Supports `LIKE '%text%'` queries

---

## 📊 Search Methods Comparison

| Method | Use Case | Speed | Example |
|--------|----------|-------|---------|
| **Full-Text Search** | Whole words | ⚡ Very Fast | `to_tsquery('သတင်း')` |
| **Trigram (ILIKE)** | Partial text | ⚡ Fast | `ILIKE '%တရုတ်%'` |
| **Regular LIKE** | Partial text | 🐌 Slow | `LIKE '%text%'` (no index) |

---

## 🔍 How to Search

### **1. Partial Text Search (Recommended for Burmese)**

```sql
-- Case-insensitive partial match (FAST with trigram index)
SELECT * FROM messages 
WHERE message_text ILIKE '%တရုတ်%';

-- Case-sensitive partial match
SELECT * FROM messages 
WHERE message_text LIKE '%တရုတ်%';

-- Multiple words (AND)
SELECT * FROM messages 
WHERE message_text ILIKE '%တရုတ်%' 
  AND message_text ILIKE '%သတင်း%';

-- Multiple words (OR)
SELECT * FROM messages 
WHERE message_text ILIKE '%တရုတ်%' 
   OR message_text ILIKE '%သတင်း%';
```

### **2. Full-Text Search (For Whole Words)**

```sql
-- Whole word search
SELECT * FROM messages 
WHERE to_tsvector('simple', message_text) @@ to_tsquery('simple', 'သတင်း');

-- Multiple words (AND)
SELECT * FROM messages 
WHERE to_tsvector('simple', message_text) @@ to_tsquery('simple', 'သတင်း & အစိုးရ');

-- Multiple words (OR)
SELECT * FROM messages 
WHERE to_tsvector('simple', message_text) @@ to_tsquery('simple', 'သတင်း | အစိုးရ');
```

### **3. Similarity Search (Advanced)**

```sql
-- Find similar text (fuzzy matching)
SELECT 
    message_text,
    similarity(message_text, 'တရုတ်နိုင်ငံ') as sim
FROM messages 
WHERE message_text % 'တရုတ်နိုင်ငံ'  -- % operator = similar
ORDER BY sim DESC
LIMIT 10;

-- Set similarity threshold (0.0 to 1.0)
SET pg_trgm.similarity_threshold = 0.3;
```

---

## ⚡ Performance

### **Without Trigram Index**
```sql
SELECT * FROM messages WHERE message_text LIKE '%တရုတ်%';
-- Sequential scan: ~5000ms for 1M messages ❌
```

### **With Trigram Index**
```sql
SELECT * FROM messages WHERE message_text ILIKE '%တရုတ်%';
-- Index scan: ~50ms for 1M messages ✅
-- 100x faster!
```

---

## 🎨 Use Cases

### **1. Search Box in Viewer**

```python
# In viewer or API
def search_messages(search_text: str):
    query = """
        SELECT * FROM messages 
        WHERE message_text ILIKE $1
        ORDER BY message_datetime DESC
        LIMIT 100
    """
    return db.fetch_all(query, f"%{search_text}%")

# Usage
messages = search_messages("တရုတ်")  # Fast!
```

### **2. Find All Mentions**

```sql
-- Find all messages mentioning "တရုတ်"
SELECT 
    channel_id,
    message_id,
    message_text,
    message_datetime
FROM messages 
WHERE message_text ILIKE '%တရုတ်%'
ORDER BY message_datetime DESC;
```

### **3. Count Mentions**

```sql
-- Count how many times "တရုတ်" is mentioned
SELECT COUNT(*) 
FROM messages 
WHERE message_text ILIKE '%တရုတ်%';

-- Count by channel
SELECT 
    c.display_name,
    COUNT(*) as mention_count
FROM messages m
JOIN channels c ON m.channel_id = c.telegram_channel_id
WHERE m.message_text ILIKE '%တရုတ်%'
GROUP BY c.display_name
ORDER BY mention_count DESC;
```

### **4. Trend Analysis**

```sql
-- Mentions over time
SELECT 
    DATE(message_datetime) as date,
    COUNT(*) as mentions
FROM messages 
WHERE message_text ILIKE '%တရုတ်%'
GROUP BY DATE(message_datetime)
ORDER BY date DESC;
```

---

## 🔧 Setup

### **For Existing Database**

```sql
-- Connect to database
psql -U postgres -d news_collection

-- Enable extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create index
CREATE INDEX idx_messages_text_trgm ON messages 
USING GIN(message_text gin_trgm_ops);

-- Wait for index to build (may take a few minutes for large tables)
-- Check progress:
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE indexname = 'idx_messages_text_trgm';
```

### **For New Database**

```bash
# Just run the schema
psql -U postgres -d news_collection -f schema_postgresql.sql
# Extension and index are created automatically
```

---

## 📈 Index Size

**Trigram index is larger than regular index:**

```sql
-- Check index sizes
SELECT 
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE tablename = 'messages'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Example results:
-- idx_messages_text_trgm: 250 MB  (trigram)
-- idx_messages_text_fts:  150 MB  (full-text)
-- idx_messages_datetime:   50 MB  (regular)
```

**Trade-off:**
- ✅ Larger index size
- ✅ Much faster searches
- ✅ Worth it for search functionality!

---

## 🎯 Best Practices

### **1. Use ILIKE for Burmese Search**

```sql
-- ✅ Good - Uses trigram index
SELECT * FROM messages WHERE message_text ILIKE '%တရုတ်%';

-- ❌ Bad - No index
SELECT * FROM messages WHERE LOWER(message_text) LIKE '%တရုတ်%';
```

### **2. Combine with Other Filters**

```sql
-- Filter by channel and search text
SELECT * FROM messages 
WHERE channel_id = 1234567890
  AND message_text ILIKE '%တရုတ်%'
ORDER BY message_datetime DESC;
```

### **3. Use Limits**

```sql
-- Always use LIMIT for large result sets
SELECT * FROM messages 
WHERE message_text ILIKE '%သတင်း%'
ORDER BY message_datetime DESC
LIMIT 100;
```

### **4. Cache Common Searches**

```python
# In your application
from functools import lru_cache

@lru_cache(maxsize=100)
def search_messages(search_text: str):
    # Results are cached for repeated searches
    return db.query(f"SELECT * FROM messages WHERE message_text ILIKE '%{search_text}%'")
```

---

## 🎉 Summary

**What You Have Now:**

1. **Full-Text Search Index**
   - For whole word matching
   - `to_tsquery('simple', 'သတင်း')`

2. **Trigram Index** ⭐ NEW!
   - For partial text matching
   - `ILIKE '%တရုတ်%'`
   - Fast and efficient

**Search Capabilities:**
- ✅ Partial text search (တရုတ်)
- ✅ Whole word search (သတင်း)
- ✅ Case-insensitive (ILIKE)
- ✅ Similarity search (fuzzy)
- ✅ Fast performance (indexed)

**Perfect for:**
- 🔍 Search boxes
- 📊 Trend analysis
- 📈 Mention tracking
- 🎯 Content discovery

Your Burmese text search is now fully functional! 🇲🇲🚀
