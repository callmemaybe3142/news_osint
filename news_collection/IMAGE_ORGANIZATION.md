# Date-Based Image Organization

## 📁 New Structure

### **Organization Pattern**
```
images/
├── 2025/
│   ├── 01/
│   │   ├── 16/
│   │   │   ├── channelname1/
│   │   │   │   ├── 123456789.jpg
│   │   │   │   ├── 987654321.jpg
│   │   │   │   └── ...
│   │   │   ├── channelname2/
│   │   │   │   ├── 111222333.jpg
│   │   │   │   └── ...
│   │   ├── 17/
│   │   │   ├── channelname1/
│   │   │   │   └── ...
│   ├── 02/
│   │   └── ...
├── 2026/
│   └── ...
```

**Path Format:** `YYYY/MM/DD/ChannelName/image.jpg`

**Example:**
```
images/2025/01/16/nugmyanmar/6190587795865275209.jpg
images/2025/01/16/Hno969888/7284951623847562891.jpg
images/2025/01/17/nugmyanmar/8395162738495162738.jpg
```

---

## ✅ Benefits

### **1. Easy Date-Based Management**
```bash
# Delete all images from a specific date
rm -rf images/2025/01/15/

# Archive a specific month
tar -czf archive_2025_01.tar.gz images/2025/01/
rm -rf images/2025/01/

# Find images from last week
find images/ -type f -mtime -7
```

### **2. Organized by Channel**
```bash
# See all images from a specific channel on a date
ls images/2025/01/16/nugmyanmar/

# Count images per channel per day
du -sh images/2025/01/16/*/
```

### **3. Scalability**
```
# Each directory has fewer files
Before: images/channelname/ (10,000+ files) ❌ Slow
After:  images/2025/01/16/channelname/ (~30 files) ✅ Fast
```

### **4. Easy Backup Strategy**
```bash
# Backup by date range
tar -czf backup_jan_2025.tar.gz images/2025/01/

# Sync to S3 by month
aws s3 sync images/2025/01/ s3://backup/2025/01/
```

### **5. Automatic Cleanup**
```bash
# Delete images older than 90 days
find images/ -type f -mtime +90 -delete

# Or by date
rm -rf images/2024/  # Delete entire year
```

---

## 🔧 Implementation

### **Updated Methods**

**`get_image_dir(message_datetime, channel_name)`**
```python
def get_image_dir(self, message_datetime, channel_name: str) -> Path:
    """
    Get or create directory for an image based on date and channel.
    Structure: YYYY/MM/DD/ChannelName
    """
    year = message_datetime.strftime('%Y')
    month = message_datetime.strftime('%m')
    day = message_datetime.strftime('%d')
    
    # Create path: images/2025/01/16/channelname/
    image_dir = self.base_dir / year / month / day / channel_name
    image_dir.mkdir(parents=True, exist_ok=True)
    return image_dir
```

**`get_file_path(message_datetime, channel_name, file_id, extension)`**
```python
def get_file_path(self, message_datetime, channel_name: str, file_id: str, extension: str = "jpg") -> Path:
    """
    Generate file path for an image with date-based organization.
    
    Returns:
        Path to image file (e.g., images/2025/01/16/channelname/12345.jpg)
    """
    safe_file_id = "".join(c if c.isalnum() or c in "-_" else "_" for c in file_id)
    filename = f"{safe_file_id}.{extension}"
    return self.get_image_dir(message_datetime, channel_name) / filename
```

**`download_and_compress_photo()`**
```python
# Get file path with date-based organization
file_path = self.get_file_path(message.date, channel_name, file_id, extension)
```

---

## 📊 Storage Efficiency

### **Directory Size Comparison**

**Before (Flat Structure):**
```
images/channelname1/  (10,000 files)  # Slow to list
images/channelname2/  (15,000 files)  # Slow to list
images/channelname3/  (8,000 files)   # Slow to list
```

**After (Date-Based):**
```
images/2025/01/16/channelname1/  (~30 files)  # Fast!
images/2025/01/16/channelname2/  (~45 files)  # Fast!
images/2025/01/16/channelname3/  (~25 files)  # Fast!
```

**Performance:**
- ✅ Faster directory listing
- ✅ Faster file operations
- ✅ Better filesystem performance
- ✅ Easier to navigate

---

## 🗄️ Database Storage

**File paths are stored relative to IMAGE_DIR:**

```sql
-- Example database entry
file_path: "2025/01/16/nugmyanmar/6190587795865275209.jpg"

-- Full path constructed as:
full_path = IMAGE_DIR + "/" + file_path
         = "/var/lib/news_osint/images/2025/01/16/nugmyanmar/6190587795865275209.jpg"
```

**Benefits:**
- ✅ Portable (can move IMAGE_DIR)
- ✅ Shorter database entries
- ✅ Easy to reconstruct full path

---

## 🔍 Querying Images

### **Find Images by Date**
```sql
-- All images from a specific date
SELECT * FROM images 
WHERE file_path LIKE '2025/01/16/%';

-- All images from a month
SELECT * FROM images 
WHERE file_path LIKE '2025/01/%';

-- All images from a channel on a date
SELECT * FROM images 
WHERE file_path LIKE '2025/01/16/nugmyanmar/%';
```

### **Count Images by Date**
```sql
-- Images per day
SELECT 
    SUBSTRING(file_path, 1, 10) as date,
    COUNT(*) as image_count
FROM images
GROUP BY SUBSTRING(file_path, 1, 10)
ORDER BY date DESC;

-- Result:
-- 2025/01/16 | 1,234
-- 2025/01/15 | 1,156
-- 2025/01/14 | 1,089
```

---

## 🚀 Production Usage

### **Daily Cleanup Script**
```bash
#!/bin/bash
# cleanup_old_images.sh

# Delete images older than 90 days
CUTOFF_DATE=$(date -d "90 days ago" +%Y/%m/%d)
IMAGE_DIR="/var/lib/news_osint/images"

# Find and delete old directories
find "$IMAGE_DIR" -type d -path "*/[0-9][0-9][0-9][0-9]/[0-9][0-9]/[0-9][0-9]" | while read dir; do
    DIR_DATE=$(echo "$dir" | grep -oP '\d{4}/\d{2}/\d{2}')
    if [[ "$DIR_DATE" < "$CUTOFF_DATE" ]]; then
        echo "Deleting old images: $dir"
        rm -rf "$dir"
    fi
done
```

### **Monthly Archive Script**
```bash
#!/bin/bash
# archive_monthly.sh

# Archive last month's images
LAST_MONTH=$(date -d "last month" +%Y/%m)
IMAGE_DIR="/var/lib/news_osint/images"
ARCHIVE_DIR="/backup/archives"

# Create archive
tar -czf "$ARCHIVE_DIR/images_$LAST_MONTH.tar.gz" "$IMAGE_DIR/$LAST_MONTH/"

# Upload to S3
aws s3 cp "$ARCHIVE_DIR/images_$LAST_MONTH.tar.gz" "s3://news-archive/"

# Delete local copy after successful upload
if [ $? -eq 0 ]; then
    rm -rf "$IMAGE_DIR/$LAST_MONTH/"
    echo "Archived and deleted: $LAST_MONTH"
fi
```

### **Disk Usage Monitoring**
```bash
#!/bin/bash
# monitor_disk.sh

IMAGE_DIR="/var/lib/news_osint/images"

# Check disk usage by month
echo "Disk usage by month:"
du -sh "$IMAGE_DIR"/*/

# Check total usage
echo ""
echo "Total image storage:"
du -sh "$IMAGE_DIR"

# Alert if over 80% full
USAGE=$(df -h "$IMAGE_DIR" | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$USAGE" -gt 80 ]; then
    echo "WARNING: Disk usage is at ${USAGE}%"
    # Send alert email
    echo "Disk usage critical: ${USAGE}%" | mail -s "Disk Alert" admin@example.com
fi
```

---

## 📋 Migration from Old Structure

If you have existing images in the old structure (`images/channelname/`):

```python
# migrate_images.py
import os
from pathlib import Path
from datetime import datetime
import asyncio
import asyncpg

async def migrate_images():
    """Migrate images from old structure to new date-based structure."""
    
    # Connect to database
    conn = await asyncpg.connect(
        host='localhost',
        database='news_collection',
        user='postgres',
        password='yourpassword'
    )
    
    # Get all images with their message dates
    rows = await conn.fetch("""
        SELECT 
            i.file_path,
            m.message_datetime,
            c.name as channel_name
        FROM images i
        JOIN messages m ON i.message_channel_id = m.channel_id 
                        AND i.message_message_id = m.message_id
        JOIN channels c ON m.channel_id = c.telegram_channel_id
    """)
    
    old_base = Path('images')
    new_base = Path('images_new')
    
    for row in rows:
        old_path = old_base / row['file_path']
        
        if not old_path.exists():
            continue
        
        # Create new path
        dt = row['message_datetime']
        year = dt.strftime('%Y')
        month = dt.strftime('%m')
        day = dt.strftime('%d')
        channel = row['channel_name']
        filename = old_path.name
        
        new_path = new_base / year / month / day / channel / filename
        new_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Move file
        os.rename(old_path, new_path)
        
        # Update database
        new_relative = str(new_path.relative_to(new_base))
        await conn.execute(
            "UPDATE images SET file_path = $1 WHERE file_path = $2",
            new_relative, row['file_path']
        )
        
        print(f"Migrated: {old_path} -> {new_path}")
    
    await conn.close()
    print("Migration complete!")

if __name__ == '__main__':
    asyncio.run(migrate_images())
```

---

## 🎯 Summary

**New Structure:**
```
images/YYYY/MM/DD/ChannelName/image.jpg
```

**Benefits:**
- ✅ Easy date-based management
- ✅ Organized by channel
- ✅ Better performance (fewer files per directory)
- ✅ Simple backup/archive strategy
- ✅ Easy cleanup of old images
- ✅ Scalable for millions of images

**Production Ready:**
- ✅ Automatic directory creation
- ✅ Relative paths in database
- ✅ Compatible with archiving
- ✅ Easy to monitor and maintain

Your image storage is now production-ready! 🚀
