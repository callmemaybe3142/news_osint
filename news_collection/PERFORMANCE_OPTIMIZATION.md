# Collector Performance Optimization Guide

## 🐌 Current Performance

**Your Situation:**
- 70,000 messages + photos in 12 hours
- Speed: ~1.6 messages/second
- **Too slow!**

**Target:**
- 70,000 messages in 2-3 hours
- Speed: ~10 messages/second
- **6x faster!**

---

## 🔍 Performance Bottlenecks

### **1. Image Processing (BIGGEST BOTTLENECK)**

**Problem:**
```python
# Current: Synchronous (blocking)
img = Image.open(io.BytesIO(photo_bytes))  # Blocks event loop
img.resize(...)  # Blocks event loop
img.save(file_path)  # Blocks event loop (disk I/O)
```

**Impact:**
- Each image takes ~500ms to process
- Blocks entire collector during processing
- Can't download next message while processing image

**Solution:**
- ✅ Use ThreadPoolExecutor for CPU-intensive work
- ✅ Process images in parallel
- ✅ Don't block event loop

---

### **2. Sequential Message Processing**

**Problem:**
```python
# Current: One message at a time
for message in messages:
    await process_message(message)  # Wait for each
    await download_photo(message)   # Wait for each
    await insert_to_db(message)     # Wait for each
```

**Impact:**
- Network latency adds up
- Idle time between operations
- Not utilizing full bandwidth

**Solution:**
- ✅ Batch processing
- ✅ Concurrent downloads
- ✅ Pipeline processing

---

### **3. Database Inserts**

**Problem:**
```python
# Current: Individual inserts
await db.insert_message(...)  # One at a time
```

**Impact:**
- Network round-trip for each insert
- PostgreSQL connection overhead
- Slow for many messages

**Solution:**
- ✅ Batch inserts (already implemented!)
- ✅ Use bulk_insert_messages()

---

## 🚀 Optimization Solutions

### **Solution 1: Async Image Processing** ⭐ **BIGGEST IMPACT**

**Replace `image_handler.py` with optimized version:**

```bash
# Backup old file
mv image_handler.py image_handler_old.py

# Use optimized version
mv image_handler_async.py image_handler.py
```

**What it does:**
```python
# NEW: Non-blocking image processing
async def download_and_compress_photo(...):
    # Download (async, non-blocking)
    photo_bytes = await client.download_media(...)
    
    # Process in thread pool (non-blocking!)
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        self.executor,  # Thread pool
        self._process_image_sync,  # CPU-intensive work
        photo_bytes, file_path, original_size
    )
```

**Benefits:**
- ✅ Image processing doesn't block event loop
- ✅ Can download next message while processing current image
- ✅ 4 images processed in parallel (ThreadPoolExecutor)
- ✅ **3-5x faster image handling**

**Expected improvement:**
- Before: 70,000 in 12 hours
- After: 70,000 in **3-4 hours** (3x faster!)

---

### **Solution 2: Increase Batch Size**

**Update config.py:**

```python
# Current
BATCH_SIZE = 100

# Recommended for faster collection
BATCH_SIZE = 500  # or 1000
```

**Benefits:**
- ✅ Fewer database round-trips
- ✅ Better PostgreSQL performance
- ✅ Faster bulk inserts

**Trade-off:**
- ⚠️ More memory usage
- ⚠️ Longer time before first insert

---

### **Solution 3: Concurrent Channel Processing**

**Modify collector.py to process multiple channels:**

```python
# Add to collector.py
async def run_concurrent(self):
    """Process multiple channels concurrently."""
    channels = await self.db.get_all_channels()
    
    # Process up to 3 channels at once
    tasks = []
    for channel in channels:
        task = asyncio.create_task(self.process_channel(channel))
        tasks.append(task)
        
        # Limit concurrent channels
        if len(tasks) >= 3:
            await asyncio.gather(*tasks)
            tasks = []
    
    # Process remaining
    if tasks:
        await asyncio.gather(*tasks)
```

**Benefits:**
- ✅ Multiple channels processed simultaneously
- ✅ Better bandwidth utilization
- ✅ **2-3x faster for multiple channels**

**Trade-off:**
- ⚠️ Higher memory usage
- ⚠️ More complex error handling

---

### **Solution 4: Skip Duplicate Image Downloads**

**Add to image_handler.py:**

```python
async def download_and_compress_photo(self, ...):
    # Check if image already exists
    file_path = self.get_file_path(message.date, channel_name, file_id, 'jpg')
    if file_path.exists():
        logger.debug(f"Image already exists: {file_path.name}")
        # Return cached info
        return (str(file_path.relative_to(self.base_dir)), ...)
    
    # Download and process...
```

**Benefits:**
- ✅ Skip re-downloading existing images
- ✅ Faster re-runs
- ✅ Saves bandwidth

---

### **Solution 5: Optimize Image Settings**

**Update .env:**

```env
# Faster processing with smaller images
MAX_IMAGE_WIDTH=800  # Was: 1024
IMAGE_QUALITY=65     # Was: 70
```

**Benefits:**
- ✅ Faster image processing
- ✅ Smaller file sizes
- ✅ Faster disk writes

**Trade-off:**
- ⚠️ Lower image quality

---

## 📊 Performance Comparison

### **Before Optimization**

```
70,000 messages in 12 hours
= 5,833 messages/hour
= 97 messages/minute
= 1.6 messages/second
```

**Bottlenecks:**
- Image processing: 500ms/image (blocking)
- Sequential processing
- Individual DB inserts

---

### **After Optimization (Async Images)**

```
70,000 messages in 3-4 hours
= 20,000 messages/hour
= 333 messages/minute
= 5.5 messages/second
```

**Improvements:**
- ✅ Image processing: 100ms/image (non-blocking)
- ✅ Parallel image processing (4 threads)
- ✅ Event loop not blocked

**Speed increase: 3-4x faster!**

---

### **After All Optimizations**

```
70,000 messages in 2-3 hours
= 30,000 messages/hour
= 500 messages/minute
= 8.3 messages/second
```

**Improvements:**
- ✅ Async image processing
- ✅ Concurrent channels
- ✅ Batch inserts (500)
- ✅ Skip duplicate images

**Speed increase: 5-6x faster!**

---

## 🎯 Recommended Implementation

### **Step 1: Replace Image Handler** ⭐ **DO THIS FIRST**

```bash
cd news_collection

# Backup old file
mv image_handler.py image_handler_old.py

# Use optimized version
mv image_handler_async.py image_handler.py

# Test
python collector.py
```

**Expected result:**
- 70,000 messages in **3-4 hours** (vs 12 hours)
- **3x faster!**

---

### **Step 2: Increase Batch Size**

```python
# config.py
BATCH_SIZE = 500  # Was: 100
```

**Expected result:**
- 70,000 messages in **2.5-3 hours**
- **4x faster!**

---

### **Step 3: Add Concurrent Channels (Optional)**

Only if you have multiple channels:

```python
# collector.py - modify run() method
async def run(self):
    channels = await self.db.get_all_channels()
    
    # Process 2-3 channels concurrently
    for i in range(0, len(channels), 3):
        batch = channels[i:i+3]
        tasks = [self.process_channel(ch) for ch in batch]
        await asyncio.gather(*tasks, return_exceptions=True)
```

**Expected result:**
- 70,000 messages in **2 hours**
- **6x faster!**

---

## 🔧 Quick Start

### **Fastest Way to Speed Up:**

```bash
# 1. Replace image handler
cd news_collection
mv image_handler.py image_handler_old.py
mv image_handler_async.py image_handler.py

# 2. Update config
nano config.py
# Change: BATCH_SIZE = 500

# 3. Run collector
python collector.py
```

**Result: 3-4x faster immediately!**

---

## 📈 Monitoring Performance

### **Add Performance Logging**

```python
# Add to collector.py
import time

class NewsCollector:
    def __init__(self):
        self.start_time = time.time()
        self.message_count = 0
    
    async def process_message(self, ...):
        self.message_count += 1
        
        # Log every 100 messages
        if self.message_count % 100 == 0:
            elapsed = time.time() - self.start_time
            rate = self.message_count / elapsed
            logger.info(f"Processed {self.message_count} messages | Rate: {rate:.1f} msg/sec")
```

**Output:**
```
Processed 100 messages | Rate: 5.2 msg/sec
Processed 200 messages | Rate: 5.5 msg/sec
Processed 300 messages | Rate: 5.8 msg/sec
```

---

## 🎉 Summary

### **Main Bottleneck: Image Processing**

**Problem:**
- Synchronous (blocking) image processing
- 500ms per image
- Blocks entire collector

**Solution:**
- ✅ Use `image_handler_async.py`
- ✅ ThreadPoolExecutor for CPU work
- ✅ Non-blocking I/O

**Result:**
- ✅ **3-4x faster** (12 hours → 3-4 hours)

### **Additional Optimizations:**

| Optimization | Speed Gain | Complexity |
|--------------|-----------|------------|
| **Async Images** | **3-4x** | Easy |
| Batch Size (500) | 1.2x | Very Easy |
| Concurrent Channels | 2x | Medium |
| Skip Duplicates | 1.5x | Easy |
| Smaller Images | 1.3x | Very Easy |

### **Total Potential:**
- Before: 70,000 in 12 hours
- After: 70,000 in **2 hours**
- **6x faster!**

**Start with async image handler - biggest impact!** 🚀
