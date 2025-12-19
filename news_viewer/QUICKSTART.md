# News Viewer GUI - Quick Guide

## 🎨 What You Get

A beautiful, modern GUI application to view and verify your collected Telegram news!

![News Viewer Interface](See the mockup image for visual reference)

## ✨ Features

### 📊 Statistics Panel
- **Total Messages**: All collected messages
- **Original vs Duplicates**: See how many duplicates were detected
- **Messages with Images**: Count of messages containing photos
- **Total Images**: Number of downloaded images
- **Channels**: Number of monitored channels

### 🔍 Filters
- **Channel Dropdown**: Filter by specific channel or view all
- **Show Duplicates**: Toggle to show/hide duplicate messages
- **Search**: Find messages by text content

### 📰 Message Display
- **Pagination**: Browse 50 messages per page
- **Message Cards**: Each card shows:
  - 📢 Channel name (colored in blue)
  - 🕐 Timestamp
  - 📝 Message text (scrollable if long)
  - 🖼️ Image thumbnails (if any)
  - ⚠️ Duplicate indicator (if applicable)

### 🎨 Design
- Modern dark theme (easy on the eyes)
- Blue accent color (#007acc)
- Smooth scrolling
- Responsive layout

## 🚀 How to Use

### 1. Launch the Viewer

**Option A: Double-click the batch file**
```
news_viewer/run_viewer.bat
```

**Option B: Command line**
```bash
cd news_viewer
python viewer.py
```

### 2. Browse Your News

**View All Messages:**
- Just launch the app, messages load automatically
- Scroll through the list
- Use mouse wheel to scroll

**Filter by Channel:**
1. Click the "Channel" dropdown
2. Select a specific channel
3. Messages refresh automatically

**Search for Text:**
1. Type your search term in the search box
2. Press Enter or click "Search"
3. Results update instantly

**Show/Hide Duplicates:**
1. Check/uncheck "Show duplicates"
2. Messages refresh automatically

**Navigate Pages:**
- Click "◀ Previous" or "Next ▶"
- Page number shows current position

## 📋 What You'll See

### Message Card Example

```
┌─────────────────────────────────────────────────────┐
│ 📢 National Unity Government    2025-12-15 13:45   │
│                                                     │
│ Breaking news about the economy and political      │
│ situation in Myanmar. The government announced...  │
│                                                     │
│ [Image: 1280x720 | 45.2 KB]                       │
└─────────────────────────────────────────────────────┘
```

### Duplicate Message Example

```
┌─────────────────────────────────────────────────────┐
│ 📢 IT Vision Channel           2025-12-15 14:30    │
│ ⚠ DUPLICATE  Original: NUG Myanmar (2025-12-14)   │
│                                                     │
│ [Text not shown - reference to original]           │
└─────────────────────────────────────────────────────┘
```

## 🎯 Use Cases

### 1. Verify Collection
- Check if messages are being collected correctly
- Verify images are downloading
- See which channels are active

### 2. Review Content
- Browse collected news
- Search for specific topics
- Check message timestamps

### 3. Check Duplicates
- See which messages are duplicates
- Verify duplicate detection is working
- Find original messages

### 4. Monitor Progress
- View statistics to see collection growth
- Check how many images were downloaded
- Monitor channel activity

## ⚙️ Configuration

Edit `config.py` to customize:

```python
# Show more/fewer messages per page
MESSAGES_PER_PAGE = 50  # Change to 25, 100, etc.

# Adjust image display size
MAX_IMAGE_DISPLAY_WIDTH = 400
MAX_IMAGE_DISPLAY_HEIGHT = 400

# Change theme colors
BG_COLOR = "#1e1e1e"        # Background
ACCENT_COLOR = "#007acc"     # Blue accent
DUPLICATE_COLOR = "#ff6b6b"  # Red for duplicates
```

## 🐛 Troubleshooting

### Database Not Found
```
Error: Database not found: ../news_collection/data/news_collection.db
```

**Solution:**
1. Make sure you've run the collector first
2. Check the database path in `config.py`
3. Verify the file exists

### No Messages Showing
**Possible causes:**
- Database is empty (run collector first)
- Filters are too restrictive (reset filters)
- Search term has no matches (clear search)

### Images Not Loading
**Possible causes:**
- Images weren't downloaded (check collector logs)
- Image path is wrong (check `config.py`)
- Image files are missing (check `images/` folder)

### Slow Performance
**Solutions:**
- Reduce `MESSAGES_PER_PAGE` to 25
- Use channel filter to narrow results
- Use search to find specific messages

## 💡 Tips

1. **Start with filters**: Use channel filter to focus on specific sources
2. **Hide duplicates**: Uncheck "Show duplicates" for cleaner view
3. **Search effectively**: Use specific keywords for better results
4. **Check statistics**: Monitor your collection progress
5. **Scroll smoothly**: Use mouse wheel for better navigation

## 🔄 Workflow

**Typical workflow:**

1. **Run Collector**
   ```bash
   cd news_collection
   python collector.py
   ```

2. **Launch Viewer**
   ```bash
   cd news_viewer
   python viewer.py
   ```

3. **Verify Collection**
   - Check statistics
   - Browse messages
   - Verify images loaded

4. **Repeat**
   - Run collector regularly
   - Check viewer to verify new messages

## 📁 Project Structure

```
news_viewer/
├── viewer.py              # Main GUI application
├── database_reader.py     # Database access layer
├── config.py              # Configuration settings
├── requirements.txt       # Dependencies (minimal)
├── run_viewer.bat        # Windows launcher
└── README.md             # This file
```

## ✅ Quick Checklist

Before using the viewer:
- [ ] Collector has run at least once
- [ ] Database exists at `../news_collection/data/news_collection.db`
- [ ] Images folder exists at `../news_collection/images/`
- [ ] Python 3.8+ installed
- [ ] Pillow installed (from main project)

## 🎉 Enjoy!

The viewer is designed to be simple and intuitive. Just launch it and start browsing your collected news!

**Need help?** Check the main README in the `news_collection` folder.
