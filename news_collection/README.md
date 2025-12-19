# Telegram News Collector

A Python-based system for collecting news messages and photos from Telegram channels with intelligent filtering, duplicate detection, and image compression.

## Features

✅ **Message Collection**
- Collects text messages from Telegram channels
- Filters messages based on configurable minimum length
- Skips forwarded messages
- Cross-channel duplicate detection using text hashing
- Exclusion rules for ads and spam (exact match or contains)

✅ **Photo Collection**
- Downloads and compresses photos from messages
- Supports WebP format (keeps as-is for smaller size)
- Configurable compression (max width, quality)
- Deduplication using Telegram's unique file_id
- Organized storage by channel name

✅ **Smart Filtering**
- Messages with photos: Always collected (any text length)
- Messages with videos/files: Collected only if text ≥ MIN_TEXT_LENGTH
- Text-only messages: Collected only if text ≥ MIN_TEXT_LENGTH
- Forwarded messages: Always skipped

✅ **Performance Optimized**
- Batch processing for database operations
- Indexed duplicate detection (fast even with millions of messages)
- Async/await for concurrent operations
- Efficient image compression with Pillow

✅ **Database**
- SQLite for development/testing
- PostgreSQL-ready schema (for production VPS deployment)
- Full-text search support (for later implementation)

## Project Structure

```
news_collection/
├── .env                    # Environment variables (create from .env.example)
├── .env.example            # Environment variables template
├── .gitignore
├── requirements.txt        # Python dependencies
├── config.py               # Configuration settings
├── collector.py            # Main collector script
├── database.py             # Database operations
├── image_handler.py        # Image download and compression
├── logger_config.py        # Logging configuration
├── manage_db.py            # Database management utility
├── schema.sql              # SQLite schema
├── data/                   # SQLite database (auto-created)
│   └── news_collection.db
├── images/                 # Downloaded images (auto-created)
│   └── {channel_name}/
│       └── {file_id}.jpg
└── logs/                   # Log files (auto-created)
    └── collector.log
```

## Installation

### 1. Prerequisites

- Python 3.8 or higher
- Telegram API credentials (API_ID and API_HASH)
- Telegram session string (from Telethon)

### 2. Install Dependencies

```bash
cd news_collection
pip install -r requirements.txt
```

### 3. Configure Environment

Copy the example environment file and edit it:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# Telegram API Credentials
API_ID=your_api_id
API_HASH=your_api_hash
SESSION_STRING=your_session_string

# Collection Settings
START_DATE=2025-05-01T00:00:00Z
MIN_TEXT_LENGTH=50

# Image Settings
MAX_IMAGE_WIDTH=1280
IMAGE_QUALITY=75
```

### 4. Get Telegram Session String

If you don't have a session string yet, create one:

```python
from telethon import TelegramClient
from telethon.sessions import StringSession

API_ID = your_api_id
API_HASH = "your_api_hash"

with TelegramClient(StringSession(), API_ID, API_HASH) as client:
    print("Your session string:")
    print(client.session.save())
```

## Usage

### 1. Initialize Database and Add Channels

Run the interactive database manager:

```bash
python manage_db.py
```

Or use command-line options:

```bash
# List all channels
python manage_db.py list-channels

# Add example channels
python manage_db.py add-examples

# List exclusion rules
python manage_db.py list-rules

# Add example exclusion rules
python manage_db.py add-rule-examples
```

**Interactive Menu:**
```
1. Add Channel
2. List Channels
3. Add Exclusion Rule
4. List Exclusion Rules
5. Exit
```

### 2. Run the Collector

```bash
python collector.py
```

The collector will:
1. Connect to Telegram
2. Fetch all channels from the database
3. For each channel:
   - Fetch messages since `last_fetched_datetime` (or START_DATE for first run)
   - Filter messages based on rules
   - Detect duplicate text across all channels
   - Download and compress photos
   - Save to database
4. Update `last_fetched_datetime` for each channel

### 3. Monitor Logs

Logs are written to both console and file:

```bash
# View real-time logs
tail -f logs/collector.log

# View recent errors
grep ERROR logs/collector.log
```

## Configuration

All settings can be adjusted in `config.py` or `.env`:

### Message Filtering

```python
MIN_TEXT_LENGTH = 50          # Minimum characters for text-only messages
SKIP_FORWARDED = True          # Skip forwarded messages
```

### Image Settings

```python
MAX_IMAGE_WIDTH = 1280         # Maximum image width (pixels)
IMAGE_QUALITY = 75             # JPEG quality (1-100)
KEEP_WEBP = True               # Keep WebP format as-is
```

### Performance

```python
BATCH_SIZE = 100               # Messages per batch insert
```

## Database Schema

### Tables

**channels**
- Stores Telegram channels to monitor
- Fields: id, name, display_name, category, last_fetched_datetime

**messages**
- Stores collected messages
- Fields: channel_id, message_id, message_text, message_datetime, has_media, is_duplicate, original_channel_id, original_message_id, text_hash

**images**
- Stores photo metadata and file paths
- Fields: id, message_channel_id, message_message_id, file_id, file_path, original_size, compressed_size, width, height

**exclusion_rules**
- Stores patterns to exclude (ads, spam)
- Fields: id, pattern, rule_type, is_case_sensitive, is_active, description

### Useful Queries

**Get all original messages with images:**
```sql
SELECT 
    m.message_text,
    m.message_datetime,
    c.display_name,
    i.file_path
FROM messages m
JOIN channels c ON m.channel_id = c.id
LEFT JOIN images i ON m.channel_id = i.message_channel_id 
    AND m.message_id = i.message_message_id
WHERE m.is_duplicate = 0
ORDER BY m.message_datetime DESC;
```

**Count duplicates:**
```sql
SELECT 
    m1.message_text,
    COUNT(*) as duplicate_count
FROM messages m1
JOIN messages m2 ON m1.channel_id = m2.original_channel_id 
    AND m1.message_id = m2.original_message_id
WHERE m2.is_duplicate = 1
GROUP BY m1.channel_id, m1.message_id
ORDER BY duplicate_count DESC;
```

## Exclusion Rules

### Rule Types

1. **Exact Match**: Message text must exactly match the pattern
2. **Contains**: Message text must contain the pattern

### Examples

```python
# Exact match (case-insensitive by default)
pattern = "Join our premium channel"
rule_type = "exact"

# Contains match (case-insensitive)
pattern = "Subscribe now"
rule_type = "contains"

# Burmese advertisement
pattern = "ကြော်ငြာ"
rule_type = "contains"
```

### Adding Rules

**Via Interactive Menu:**
```bash
python manage_db.py
# Select option 3: Add Exclusion Rule
```

**Via Database:**
```sql
INSERT INTO exclusion_rules (pattern, rule_type, is_case_sensitive, description)
VALUES ('premium channel', 'contains', 0, 'Spam filter');
```

## Duplicate Detection

### How It Works

1. **Text Hashing**: MD5 hash calculated for each message text
2. **Database Lookup**: Hash checked against existing messages (indexed for speed)
3. **Reference Storage**: Duplicates store only reference to original message
4. **Cross-Channel**: Duplicates detected across all channels

### Performance

- Hash calculation: ~0.00001s per message
- Database lookup: ~0.001s (with index)
- Total overhead: ~0.001s per message
- Scalable to millions of messages

### Example

```
Channel A, Message 100: "Breaking news about economy"
Channel B, Message 200: "Breaking news about economy" (duplicate)

Database:
Row 1: channel_id=A, message_id=100, message_text="Breaking news...", is_duplicate=0
Row 2: channel_id=B, message_id=200, message_text=NULL, is_duplicate=1, 
       original_channel_id=A, original_message_id=100
```

## Migration to PostgreSQL (Production)

The schema is PostgreSQL-ready. To migrate:

1. **Install PostgreSQL** on your VPS
2. **Update `database.py`**: Replace `aiosqlite` with `asyncpg`
3. **Update `config.py`**: Add PostgreSQL connection string
4. **Run schema**: Execute `schema.sql` on PostgreSQL
5. **Enable FTS**: Uncomment full-text search triggers

## Troubleshooting

### Common Issues

**1. "No channels found in database"**
- Solution: Add channels using `python manage_db.py`

**2. "Missing required Telegram credentials"**
- Solution: Check `.env` file has API_ID, API_HASH, SESSION_STRING

**3. "Failed to download image"**
- Solution: Check network connection, Telegram API limits
- Images are skipped but message text is still saved

**4. Database locked error**
- Solution: Close other connections to the database
- Only run one collector instance at a time

### Logs

Check logs for detailed error information:

```bash
# View all logs
cat logs/collector.log

# View errors only
grep ERROR logs/collector.log

# View warnings
grep WARNING logs/collector.log
```

## Performance Tips

1. **Batch Size**: Increase `BATCH_SIZE` for faster processing (default: 100)
2. **Image Quality**: Lower `IMAGE_QUALITY` for smaller files (default: 75)
3. **Image Width**: Reduce `MAX_IMAGE_WIDTH` for faster compression (default: 1280)
4. **Database**: Use PostgreSQL for production (better performance than SQLite)

## Future Enhancements

- [ ] Full-text search implementation for Burmese text
- [ ] Web dashboard for viewing collected messages
- [ ] Scheduled collection (cron job or systemd service)
- [ ] Statistics and analytics
- [ ] Export functionality (CSV, JSON)
- [ ] Fuzzy duplicate detection
- [ ] Video/file collection (optional)

## License

This project is for personal use. Ensure compliance with Telegram's Terms of Service.

## Support

For issues or questions, check the logs first:
```bash
tail -f logs/collector.log
```

## Credits

Built with:
- [Telethon](https://github.com/LonamiWebs/Telethon) - Telegram client library
- [Pillow](https://python-pillow.org/) - Image processing
- [aiosqlite](https://github.com/omnilib/aiosqlite) - Async SQLite
