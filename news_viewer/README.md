# Telegram News Viewer

A simple GUI application to view and verify collected news from the Telegram News Collector.

## Features

✅ **View Messages**
- Browse all collected messages with pagination
- Filter by channel
- Search messages by text
- Show/hide duplicate messages
- View message timestamps and channels

✅ **Image Display**
- View downloaded images inline
- Image thumbnails with size info
- Multiple images per message support

✅ **Statistics**
- Total messages count
- Original vs duplicate messages
- Messages with images
- Total images count
- Number of channels

✅ **Filters**
- Filter by channel
- Search by text
- Toggle duplicate visibility

## Installation

No additional installation needed! The viewer uses built-in Python libraries (tkinter).

```bash
cd news_viewer
python viewer.py
```

## Usage

### Launch the Viewer

```bash
python viewer.py
```

### Interface Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Statistics  │  Messages List                               │
│  - Total     │  ┌──────────────────────────────────────┐   │
│  - Original  │  │ 📢 Channel Name    2025-12-15 13:00 │   │
│  - Duplicates│  │                                      │   │
│              │  │ Message text here...                 │   │
│  Filters     │  │                                      │   │
│  - Channel   │  │ [Image thumbnail] 1280x720 | 45 KB  │   │
│  - Search    │  └──────────────────────────────────────┘   │
│  - Duplicates│                                              │
└─────────────────────────────────────────────────────────────┘
```

### Features

**Left Panel:**
- **Statistics**: Overview of collected data
- **Channel Filter**: Select specific channel or "All Channels"
- **Show Duplicates**: Toggle to show/hide duplicate messages
- **Search**: Search messages by text (press Enter or click Search)

**Right Panel:**
- **Messages**: Paginated list of messages
- **Pagination**: Navigate between pages (50 messages per page)
- **Message Cards**: Each card shows:
  - Channel name and timestamp
  - Duplicate indicator (if applicable)
  - Message text
  - Images (if any)

### Keyboard Shortcuts

- **Enter** in search box: Trigger search
- **Mouse Wheel**: Scroll through messages

## Configuration

Edit `config.py` to customize:

```python
# Database path
DATABASE_PATH = "../news_collection/data/news_collection.db"

# Images directory
IMAGES_DIR = "../news_collection/images"

# Display settings
MESSAGES_PER_PAGE = 50
MAX_IMAGE_DISPLAY_WIDTH = 400
MAX_IMAGE_DISPLAY_HEIGHT = 400

# Colors (customize theme)
BG_COLOR = "#1e1e1e"
ACCENT_COLOR = "#007acc"
```

## Troubleshooting

### "Database not found" Error

Make sure you've run the collector first:
```bash
cd ../news_collection
python collector.py
```

The database should be at: `../news_collection/data/news_collection.db`

### Images Not Displaying

Check that:
1. Images were downloaded by the collector
2. Images directory path is correct in `config.py`
3. Image files exist in `../news_collection/images/{channel_name}/`

### Slow Performance

If you have many messages:
1. Reduce `MESSAGES_PER_PAGE` in `config.py`
2. Use filters to narrow down results
3. Search for specific text

## Tips

- **Use filters**: Narrow down results for faster browsing
- **Search**: Find specific news quickly
- **Hide duplicates**: Focus on original content only
- **Channel filter**: View messages from specific channels

## Screenshot

The viewer features:
- 🎨 Modern dark theme
- 📊 Real-time statistics
- 🔍 Powerful search and filters
- 🖼️ Inline image display
- 📄 Pagination for large datasets
- ⚠️ Duplicate indicators

## Requirements

- Python 3.8+
- tkinter (built-in with Python)
- Pillow (for image display)

## License

Part of the Telegram News Collection System.
