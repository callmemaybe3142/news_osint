"""Logging configuration for the news collector."""
import logging
import os
from pathlib import Path
from config import Config


def setup_logger(name: str = "news_collector") -> logging.Logger:
    """
    Set up and configure logger with both file and console handlers.
    
    Args:
        name: Logger name
        
    Returns:
        Configured logger instance
    """
    # Create logger
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, Config.LOG_LEVEL))
    
    # Avoid duplicate handlers
    if logger.handlers:
        return logger
    
    # Create logs directory if it doesn't exist
    log_dir = Path(Config.LOG_FILE).parent
    log_dir.mkdir(parents=True, exist_ok=True)
    
    # Create formatters
    formatter = logging.Formatter(
        Config.LOG_FORMAT,
        datefmt=Config.LOG_DATE_FORMAT
    )
    
    # File handler with rotation (production-ready)
    from logging.handlers import RotatingFileHandler
    
    file_handler = RotatingFileHandler(
        Config.LOG_FILE,
        maxBytes=10 * 1024 * 1024,  # 10 MB per file
        backupCount=10,              # Keep 10 old files (100 MB total)
        encoding='utf-8'
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)
    
    # Console handler (important logs only)
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)
    
    # Add handlers to logger
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger


# Create default logger instance
logger = setup_logger()
