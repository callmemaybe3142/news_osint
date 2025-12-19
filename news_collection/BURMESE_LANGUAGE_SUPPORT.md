# Burmese Language Support in PostgreSQL

## 🌏 Language Configuration

### **The Issue**

PostgreSQL's default full-text search uses language-specific configurations that include:
- **Stemming**: Reducing words to root form (e.g., "running" → "run")
- **Stop words**: Common words to ignore (e.g., "the", "a", "is")
- **Dictionary**: Language-specific word lists

**Problem:** PostgreSQL doesn't have built-in Burmese language support!

---

## ✅ The Solution: 'simple' Configuration

### **What is 'simple'?**

The `simple` text search configuration:
- ✅ **No stemming** - Keeps words as-is
- ✅ **No stop words** - Indexes everything
- ✅ **Works with any language** - Including Burmese, Thai, Chinese, etc.
- ✅ **Case-insensitive** - Converts to lowercase

### **Schema Configuration**

```sql
-- Full-text search index using 'simple' configuration
CREATE INDEX idx_messages_text_fts ON messages 
USING GIN(to_tsvector('simple', COALESCE(message_text, '')));
```

---

## 🔍 How to Search

### **Basic Search**

```sql
-- Search for Burmese text
SELECT * FROM messages 
WHERE to_tsvector('simple', message_text) @@ to_tsquery('simple', 'သတင်း');

-- Search for multiple words (AND)
SELECT * FROM messages 
WHERE to_tsvector('simple', message_text) @@ to_tsquery('simple', 'သတင်း & အစိုးရ');

-- Search for multiple words (OR)
SELECT * FROM messages 
WHERE to_tsvector('simple', message_text) @@ to_tsquery('simple', 'သတင်း | အစိုးရ');
```

### **Case-Insensitive Search**

```sql
-- Both will find the same results
SELECT * FROM messages 
WHERE to_tsvector('simple', message_text) @@ to_tsquery('simple', 'သတင်း');

SELECT * FROM messages 
WHERE to_tsvector('simple', message_text) @@ to_tsquery('simple', 'သတင်း');
```

### **Partial Word Search (LIKE)**

For partial matches, use `LIKE` or `ILIKE`:

```sql
-- Case-sensitive partial match
SELECT * FROM messages 
WHERE message_text LIKE '%သတင်း%';

-- Case-insensitive partial match
SELECT * FROM messages 
WHERE message_text ILIKE '%သတင်း%';
```

---

## 📊 Performance Comparison

### **Full-Text Search (GIN Index)**

```sql
-- Fast (uses index)
SELECT * FROM messages 
WHERE to_tsvector('simple', message_text) @@ to_tsquery('simple', 'သတင်း');

-- Execution time: ~10ms for 1M messages
```

**Pros:**
- ✅ Very fast (uses GIN index)
- ✅ Supports boolean operators (AND, OR, NOT)
- ✅ Handles multiple words efficiently

**Cons:**
- ❌ Exact word matches only (no partial)
- ❌ Requires proper query syntax

### **LIKE Search (Sequential Scan)**

```sql
-- Slow (no index)
SELECT * FROM messages 
WHERE message_text LIKE '%သတင်း%';

-- Execution time: ~5000ms for 1M messages
```

**Pros:**
- ✅ Finds partial matches
- ✅ Simple syntax

**Cons:**
- ❌ Very slow (sequential scan)
- ❌ No index support for `%word%` pattern

---

## 🎯 Best Practices

### **1. Use Full-Text Search for Whole Words**

```sql
-- ✅ Good - Fast, uses index
SELECT * FROM messages 
WHERE to_tsvector('simple', message_text) @@ to_tsquery('simple', 'သတင်း');
```

### **2. Use ILIKE for Partial Matches (Small Datasets)**

```sql
-- ⚠️ Okay for small datasets (<10K messages)
SELECT * FROM messages 
WHERE message_text ILIKE '%သတင်း%'
LIMIT 100;
```

### **3. Combine Both for Best Results**

```sql
-- First filter with FTS (fast), then refine with LIKE
SELECT * FROM messages 
WHERE to_tsvector('simple', message_text) @@ to_tsquery('simple', 'သတင်း')
  AND message_text ILIKE '%အစိုးရ%'
LIMIT 100;
```

### **4. Use Trigram Index for Partial Matches (Advanced)**

```sql
-- Enable pg_trgm extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create trigram index
CREATE INDEX idx_messages_text_trgm ON messages 
USING GIN(message_text gin_trgm_ops);

-- Now LIKE/ILIKE is fast!
SELECT * FROM messages 
WHERE message_text ILIKE '%သတင်း%';
-- Uses index, much faster!
```

---

## 🔧 Advanced: Trigram Index for Burmese

### **What are Trigrams?**

Trigrams split text into 3-character chunks for fuzzy matching:
- "hello" → "hel", "ell", "llo"
- "သတင်း" → "သတင", "တင်း"

### **Setup**

```sql
-- 1. Enable extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Create trigram index
CREATE INDEX idx_messages_text_trgm ON messages 
USING GIN(message_text gin_trgm_ops);

-- 3. Now LIKE queries are fast!
SELECT * FROM messages 
WHERE message_text ILIKE '%သတင်း%';
```

### **Benefits**

- ✅ Fast partial word matching
- ✅ Fuzzy search support
- ✅ Works with any language
- ✅ Handles typos

### **When to Use**

- ✅ Need partial word matching
- ✅ Have large dataset (>100K messages)
- ✅ Users search with incomplete words
- ✅ Want fuzzy/similarity search

---

## 📝 Recommended Setup

### **For Burmese Text:**

```sql
-- 1. Simple FTS for whole word search
CREATE INDEX idx_messages_text_fts ON messages 
USING GIN(to_tsvector('simple', COALESCE(message_text, '')));

-- 2. Trigram for partial word search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_messages_text_trgm ON messages 
USING GIN(message_text gin_trgm_ops);

-- 3. Regular B-tree for exact matches
CREATE INDEX idx_messages_text_btree ON messages(message_text);
```

### **Query Strategy:**

```sql
-- Whole word search (fastest)
SELECT * FROM messages 
WHERE to_tsvector('simple', message_text) @@ to_tsquery('simple', 'သတင်း');

-- Partial word search (fast with trigram index)
SELECT * FROM messages 
WHERE message_text ILIKE '%သတင်း%';

-- Exact match (fastest)
SELECT * FROM messages 
WHERE message_text = 'သတင်းအစီအစဉ်';
```

---

## 🎉 Summary

**Current Setup:**
- ✅ Using `'simple'` configuration
- ✅ Works with Burmese language
- ✅ No stemming (keeps Burmese words intact)
- ✅ Fast whole-word search

**Optional Enhancements:**
- 💡 Add trigram index for partial matching
- 💡 Use `ILIKE` for simple partial searches
- 💡 Combine FTS + LIKE for complex queries

**For Your Use Case (Burmese News):**
```sql
-- This is what you have now (perfect for Burmese!)
CREATE INDEX idx_messages_text_fts ON messages 
USING GIN(to_tsvector('simple', COALESCE(message_text, '')));

-- Optionally add trigram for partial matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_messages_text_trgm ON messages 
USING GIN(message_text gin_trgm_ops);
```

Your PostgreSQL database is now optimized for Burmese language! 🇲🇲🚀
