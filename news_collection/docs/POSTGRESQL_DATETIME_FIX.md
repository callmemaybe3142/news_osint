# PostgreSQL Datetime Handling

## 🐛 Issue

**Error:**
```
asyncpg.exceptions.DataError: invalid input for query argument $4: '2025-12-13T04:09:22+00:00' 
(expected a datetime.date or datetime.datetime instance, got 'str')
```

**Root Cause:**
PostgreSQL (via asyncpg) expects native Python `datetime` objects, not ISO 8601 strings.

---

## 🔍 SQLite vs PostgreSQL

### **SQLite Behavior:**
```python
# SQLite stores everything as TEXT
message_datetime = message.date.isoformat()  # "2025-12-13T04:09:22+00:00"
await conn.execute("INSERT INTO messages (message_datetime) VALUES (?)", (message_datetime,))
# ✅ Works - SQLite accepts strings
```

### **PostgreSQL Behavior:**
```python
# PostgreSQL has native TIMESTAMP WITH TIME ZONE type
message_datetime = message.date.isoformat()  # "2025-12-13T04:09:22+00:00"
await conn.execute("INSERT INTO messages (message_datetime) VALUES ($1)", message_datetime)
# ❌ Error - PostgreSQL expects datetime object, not string!
```

---

## 🔧 The Fix

### **Before (Broken):**
```python
# collector.py
message_datetime = message.date.isoformat()  # ❌ Convert to string

# database_postgresql.py
async def insert_message(message_datetime: str):  # ❌ Type hint says string
    await conn.execute(..., message_datetime)  # ❌ Passes string to PostgreSQL
```

### **After (Fixed):**
```python
# collector.py
message_datetime = message.date  # ✅ Keep as datetime object

# database_postgresql.py
async def insert_message(message_datetime):  # ✅ Accepts datetime object
    await conn.execute(..., message_datetime)  # ✅ Passes datetime to PostgreSQL
```

---

## 📊 Data Type Mapping

| Python Type | SQLite Storage | PostgreSQL Type |
|-------------|----------------|-----------------|
| `datetime.datetime` | TEXT (ISO string) | `TIMESTAMP WITH TIME ZONE` |
| `str` (ISO format) | TEXT | ❌ Error |
| `int` (timestamp) | INTEGER | `TIMESTAMP` (after conversion) |

**Key Difference:**
- **SQLite:** Type-agnostic, stores everything as TEXT/INTEGER/REAL/BLOB
- **PostgreSQL:** Strongly typed, expects correct Python types

---

## ✅ Benefits of Using datetime Objects

### **1. Type Safety**
```python
# PostgreSQL enforces correct types
message_datetime = "invalid date"  # ❌ Will error
message_datetime = datetime.now()  # ✅ Correct type
```

### **2. Timezone Awareness**
```python
# PostgreSQL handles timezones correctly
message_datetime = datetime.now(timezone.utc)  # ✅ Timezone-aware
# Stored as: 2025-12-16 08:00:00+00:00
# Queried in local timezone: 2025-12-16 13:30:00+05:30
```

### **3. Date Arithmetic**
```sql
-- PostgreSQL can do date math
SELECT * FROM messages 
WHERE message_datetime > NOW() - INTERVAL '7 days';

-- With strings, this wouldn't work!
```

### **4. Proper Indexing**
```sql
-- PostgreSQL can efficiently index datetime columns
CREATE INDEX idx_messages_datetime ON messages(message_datetime);

-- Range queries are fast
SELECT * FROM messages 
WHERE message_datetime BETWEEN '2025-01-01' AND '2025-12-31';
```

---

## 🎯 Changes Made

### **1. collector.py**
```python
# Line 118: Changed from
message_datetime = message.date.isoformat()

# To
message_datetime = message.date  # Keep as datetime object
```

### **2. database_postgresql.py**
```python
# insert_message parameter
async def insert_message(
    ...,
    message_datetime,  # Changed from: message_datetime: str
    ...
):
    """
    Args:
        message_datetime: datetime object (timezone-aware)  # Updated docs
    """

# update_channel_last_fetched parameter
async def update_channel_last_fetched(
    channel_id: int,
    datetime_obj  # Changed from: datetime_str: str
):
    """
    Args:
        datetime_obj: datetime object (timezone-aware)  # Updated docs
    """
```

---

## 🧪 Testing

### **Verify Fix:**
```bash
# Run collector
python collector.py

# Should see:
# ✅ No DataError
# ✅ Messages inserted successfully
# ✅ Timestamps stored correctly
```

### **Verify Data:**
```sql
-- Check message timestamps
SELECT 
    message_id,
    message_datetime,
    message_datetime AT TIME ZONE 'UTC' as utc_time,
    message_datetime AT TIME ZONE 'Asia/Yangon' as local_time
FROM messages
LIMIT 5;

-- Should show proper timestamps with timezone info
```

---

## 📝 Best Practices

### **1. Always Use Timezone-Aware Datetimes**
```python
from datetime import datetime, timezone

# ✅ Good
dt = datetime.now(timezone.utc)

# ❌ Bad (naive datetime)
dt = datetime.now()
```

### **2. Let PostgreSQL Handle Timezone Conversion**
```sql
-- PostgreSQL automatically converts timezones
SELECT message_datetime AT TIME ZONE 'Asia/Yangon' FROM messages;
```

### **3. Use datetime Objects Throughout**
```python
# Don't convert to string until display
message_datetime = message.date  # datetime object
await db.insert_message(message_datetime=message_datetime)  # Pass as-is

# Only convert to string for display
print(f"Message time: {message_datetime.isoformat()}")
```

---

## 🎉 Summary

**Problem:**
- ❌ Passing ISO strings to PostgreSQL
- ❌ PostgreSQL expects datetime objects
- ❌ Type mismatch error

**Solution:**
- ✅ Keep datetime objects as-is
- ✅ Pass datetime objects to database
- ✅ Let PostgreSQL handle storage

**Benefits:**
- ✅ Type safety
- ✅ Timezone awareness
- ✅ Proper date arithmetic
- ✅ Efficient indexing
- ✅ Better performance

**Result:**
- ✅ Collector works with PostgreSQL
- ✅ Timestamps stored correctly
- ✅ Timezone handling automatic

The system now properly handles datetimes with PostgreSQL! 🚀
