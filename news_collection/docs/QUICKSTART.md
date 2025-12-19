# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
cd news_collection
pip install -r requirements.txt
```

### Step 2: Configure Environment

1. Copy the example environment file:
```bash
copy .env.example .env
```

2. Edit `.env` and add your Telegram credentials:
```env
API_ID=12345678
API_HASH=your_api_hash_here
SESSION_STRING=your_session_string_here
```

**Don't have a session string?** Run this Python code once:

```python
from telethon import TelegramClient
from telethon.sessions import StringSession

API_ID = 12345678  # Your API ID
API_HASH = "your_api_hash"  # Your API hash

with TelegramClient(StringSession(), API_ID, API_HASH) as client:
    print("Your session string:")
    print(client.session.save())
```

### Step 3: Add Channels

Run the database manager:

```bash
python manage_db.py
```

Select option `1` to add a channel:
```
Channel username: nugmyanmar
Display name: National Unity Government
Category: Politics
```

Add as many channels as you want, then select option `5` to exit.

### Step 4: (Optional) Add Exclusion Rules

To filter out ads and spam:

```bash
python manage_db.py
```

Select option `3` to add exclusion rules:
```
Pattern: ကြော်ငြာ
Rule type: 2 (Contains)
Case sensitive: N
Description: Burmese advertisement
```

Or quickly add example rules:
```bash
python manage_db.py add-rule-examples
```

### Step 5: Run the Collector

```bash
python collector.py
```

That's it! The collector will:
- ✅ Fetch messages from all channels
- ✅ Download and compress photos
- ✅ Detect and skip duplicates
- ✅ Filter out ads and spam
- ✅ Save everything to the database

### Step 6: View Results

Check the database:
```bash
# On Windows
sqlite3 data/news_collection.db "SELECT COUNT(*) FROM messages;"

# Or use any SQLite browser
```

Check the logs:
```bash
type logs\collector.log
```

Check downloaded images:
```bash
dir images\
```

## 📊 What Gets Collected?

### ✅ Collected:
- Text messages ≥ 50 characters
- Messages with photos (any text length)
- Messages with videos/files (if text ≥ 50 characters)
- Captions from photos

### ❌ Skipped:
- Forwarded messages
- Text-only messages < 50 characters
- Messages matching exclusion rules
- Duplicate text (stores reference only)
- Messages with videos/files and text < 50 characters

## 🎛️ Adjust Settings

Edit `config.py` or `.env`:

```python
# Minimum text length (characters)
MIN_TEXT_LENGTH = 50

# Image compression
MAX_IMAGE_WIDTH = 1280
IMAGE_QUALITY = 75

# Start date for first collection
START_DATE = "2025-05-01T00:00:00Z"
```

## 🔄 Run Regularly

### Manual:
```bash
python collector.py
```

### Scheduled (Windows Task Scheduler):
1. Open Task Scheduler
2. Create Basic Task
3. Trigger: Daily (or your preference)
4. Action: Start a program
5. Program: `python`
6. Arguments: `collector.py`
7. Start in: `D:\JOB\PROJECTS\news_osint\news_collection`

### Scheduled (Linux cron):
```bash
# Edit crontab
crontab -e

# Add this line to run every hour
0 * * * * cd /path/to/news_collection && python collector.py
```

## 🐛 Troubleshooting

**Problem: "No channels found"**
```bash
python manage_db.py list-channels
# If empty, add channels with option 1
```

**Problem: "Missing credentials"**
```bash
# Check .env file exists and has correct values
type .env
```

**Problem: "Failed to download image"**
- Check internet connection
- Check Telegram API limits (wait a few minutes)
- Images are skipped but text is still saved

**Problem: Database locked**
- Close any other programs accessing the database
- Run only one collector instance at a time

## 📈 Next Steps

1. **View collected data**: Use SQLite browser or write queries
2. **Add more channels**: `python manage_db.py`
3. **Refine exclusion rules**: Filter out more spam
4. **Schedule collection**: Set up cron/Task Scheduler
5. **Migrate to PostgreSQL**: For production VPS deployment

## 💡 Tips

- **Start small**: Add 1-2 channels first to test
- **Monitor logs**: Check `logs/collector.log` for issues
- **Adjust MIN_TEXT_LENGTH**: Lower for more messages, higher for quality
- **Image quality**: Lower for disk space, higher for quality
- **Batch size**: Increase for faster processing (default: 100)

## 📚 Full Documentation

See [README.md](README.md) for complete documentation.

## ✅ Checklist

- [ ] Installed dependencies
- [ ] Created `.env` file with credentials
- [ ] Added at least one channel
- [ ] Ran collector successfully
- [ ] Checked logs for errors
- [ ] Verified images downloaded
- [ ] Set up scheduled collection (optional)

Happy collecting! 🎉
