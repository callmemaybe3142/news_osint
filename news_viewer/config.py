"""Configuration for the news viewer GUI."""
import os
from pathlib import Path

# PostgreSQL Database Configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 5432)),
    'database': os.getenv('DB_NAME', 'news_collection'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'enigmapostgres')
}


# Images directory (relative to the news_collection folder)
IMAGES_DIR = os.path.join("..", "news_collection", "images")

# GUI Settings
WINDOW_TITLE = "Telegram News Viewer"
WINDOW_WIDTH = 1200
WINDOW_HEIGHT = 800

# Display Settings
MESSAGES_PER_PAGE = 50
MAX_IMAGE_DISPLAY_WIDTH = 400
MAX_IMAGE_DISPLAY_HEIGHT = 400

# Colors (Modern Dark Theme)
BG_COLOR = "#1e1e1e"
FG_COLOR = "#ffffff"
ACCENT_COLOR = "#007acc"
SECONDARY_BG = "#2d2d2d"
BORDER_COLOR = "#3e3e3e"
HIGHLIGHT_COLOR = "#264f78"
TEXT_COLOR = "#d4d4d4"
DUPLICATE_COLOR = "#ff6b6b"
