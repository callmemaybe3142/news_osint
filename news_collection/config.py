"""Configuration settings for the news collector."""
import os
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Application configuration."""
    
    # Telegram API
    API_ID = int(os.getenv("API_ID", 0))
    API_HASH = os.getenv("API_HASH", "")
    SESSION_STRING = os.getenv("SESSION_STRING", "")
    
    # Database - PostgreSQL
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = int(os.getenv("DB_PORT", 5432))
    DB_NAME = os.getenv("DB_NAME", "news_collection")
    DB_USER = os.getenv("DB_USER", "postgres")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_MIN_POOL_SIZE = int(os.getenv("DB_MIN_POOL_SIZE", 10))
    DB_MAX_POOL_SIZE = int(os.getenv("DB_MAX_POOL_SIZE", 20))
    
    # Collection Settings
    START_DATE_STR = os.getenv("START_DATE", "2025-05-01T00:00:00Z")
    START_DATE = datetime.fromisoformat(START_DATE_STR.replace('Z', '+00:00'))
    MIN_TEXT_LENGTH = int(os.getenv("MIN_TEXT_LENGTH", 50))
    
    # Message Filtering
    SKIP_FORWARDED = True
    COLLECT_PHOTOS = True
    COLLECT_VIDEOS = False  # Don't download videos, but collect text
    COLLECT_FILES = False   # Don't download files, but collect text
    
    # Image Settings
    IMAGE_DIR = os.getenv("IMAGE_DIR", "images")
    MAX_IMAGE_WIDTH = int(os.getenv("MAX_IMAGE_WIDTH", 1280))
    IMAGE_QUALITY = int(os.getenv("IMAGE_QUALITY", 75))
    KEEP_WEBP = True  # Keep WebP format as-is
    
    # Performance
    BATCH_SIZE = 100  # Process messages in batches for duplicate checking
    
    # Logging
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE = os.getenv("LOG_FILE", "logs/collector.log")
    LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    LOG_DATE_FORMAT = "%Y-%m-%d %H:%M:%S"
    
    @classmethod
    def validate(cls):
        """Validate required configuration."""
        if not cls.API_ID or not cls.API_HASH or not cls.SESSION_STRING:
            raise ValueError(
                "Missing required Telegram credentials. "
                "Please set API_ID, API_HASH, and SESSION_STRING in .env file."
            )
        return True
