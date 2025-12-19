"""Database operations for the news collector."""
import aiosqlite
import hashlib
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from config import Config
from logger_config import logger


class Database:
    """Handles all database operations for the news collector."""
    
    def __init__(self, db_path: str = None):
        """
        Initialize database handler.
        
        Args:
            db_path: Path to SQLite database file
        """
        self.db_path = db_path or Config.DATABASE_PATH
        self.connection: Optional[aiosqlite.Connection] = None
        
    async def connect(self):
        """Establish database connection."""
        # Create data directory if it doesn't exist
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        
        self.connection = await aiosqlite.connect(self.db_path)
        self.connection.row_factory = aiosqlite.Row
        logger.info(f"Connected to database: {self.db_path}")
        
    async def close(self):
        """Close database connection."""
        if self.connection:
            await self.connection.close()
            logger.info("Database connection closed")
            
    async def initialize_schema(self):
        """Initialize database schema from schema.sql file."""
        schema_path = Path(__file__).parent / "schema.sql"
        
        if not schema_path.exists():
            raise FileNotFoundError(f"Schema file not found: {schema_path}")
            
        with open(schema_path, 'r', encoding='utf-8') as f:
            schema_sql = f.read()
            
        await self.connection.executescript(schema_sql)
        await self.connection.commit()
        logger.info("Database schema initialized")
        
    # ========================================================================
    # CHANNEL OPERATIONS
    # ========================================================================
    
    async def get_all_channels(self) -> List[Dict]:
        """
        Fetch all channels from the database.
        
        Returns:
            List of channel dictionaries
        """
        async with self.connection.execute(
            """SELECT telegram_channel_id as id, telegram_channel_id, name, display_name, category, last_fetched_datetime 
               FROM channels"""
        ) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]
            
    async def update_channel_last_fetched(self, channel_id: int, datetime_str: str):
        """
        Update the last_fetched_datetime for a channel.
        
        Args:
            channel_id: Telegram channel ID
            datetime_str: ISO 8601 datetime string
        """
        await self.connection.execute(
            "UPDATE channels SET last_fetched_datetime = ? WHERE telegram_channel_id = ?",
            (datetime_str, channel_id)
        )
        await self.connection.commit()
        logger.debug(f"Updated last_fetched_datetime for channel {channel_id}")
        
    async def add_channel(
        self, 
        name: str, 
        telegram_channel_id: int,
        display_name: str = None, 
        category: str = None
    ):
        """
        Add a new channel to the database.
        
        Args:
            name: Channel username
            telegram_channel_id: Telegram's actual channel ID (used as PK)
            display_name: Human-readable name
            category: Channel category
        """
        await self.connection.execute(
            """INSERT OR IGNORE INTO channels 
               (telegram_channel_id, name, display_name, category) 
               VALUES (?, ?, ?, ?)""",
            (telegram_channel_id, name, display_name, category)
        )
        await self.connection.commit()
        logger.info(f"Added channel: {name} (Telegram ID: {telegram_channel_id})")
        
    # ========================================================================
    # EXCLUSION RULES OPERATIONS
    # ========================================================================
    
    async def get_active_exclusion_rules(self) -> List[Dict]:
        """
        Fetch all active exclusion rules.
        
        Returns:
            List of exclusion rule dictionaries
        """
        async with self.connection.execute(
            "SELECT pattern, rule_type, is_case_sensitive FROM exclusion_rules WHERE is_active = 1"
        ) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]
            
    async def add_exclusion_rule(
        self, 
        pattern: str, 
        rule_type: str, 
        is_case_sensitive: bool = False,
        description: str = None
    ):
        """
        Add a new exclusion rule.
        
        Args:
            pattern: Text pattern to match
            rule_type: 'exact' or 'contains'
            is_case_sensitive: Whether matching is case-sensitive
            description: Optional description
        """
        await self.connection.execute(
            """INSERT INTO exclusion_rules 
               (pattern, rule_type, is_case_sensitive, description) 
               VALUES (?, ?, ?, ?)""",
            (pattern, rule_type, 1 if is_case_sensitive else 0, description)
        )
        await self.connection.commit()
        logger.info(f"Added exclusion rule: {rule_type} - {pattern}")
        
    def should_exclude_message(self, message_text: str, rules: List[Dict]) -> bool:
        """
        Check if message text matches any exclusion rule.
        
        Args:
            message_text: Message text to check
            rules: List of exclusion rules
            
        Returns:
            True if message should be excluded
        """
        if not message_text or not rules:
            return False
            
        for rule in rules:
            pattern = rule['pattern']
            rule_type = rule['rule_type']
            is_case_sensitive = bool(rule['is_case_sensitive'])
            
            # Prepare text for comparison
            text_to_check = message_text if is_case_sensitive else message_text.lower()
            pattern_to_check = pattern if is_case_sensitive else pattern.lower()
            
            # Check match based on rule type
            if rule_type == 'exact':
                if text_to_check == pattern_to_check:
                    logger.debug(f"Message excluded by exact match: {pattern}")
                    return True
            elif rule_type == 'contains':
                if pattern_to_check in text_to_check:
                    logger.debug(f"Message excluded by contains match: {pattern}")
                    return True
                    
        return False
        
    # ========================================================================
    # MESSAGE OPERATIONS
    # ========================================================================
    
    @staticmethod
    def calculate_text_hash(text: str) -> str:
        """
        Calculate MD5 hash of text for duplicate detection.
        
        Args:
            text: Message text
            
        Returns:
            MD5 hash string
        """
        if not text:
            return ""
        return hashlib.md5(text.encode('utf-8')).hexdigest()
        
    async def find_duplicate(self, text_hash: str) -> Optional[Tuple[int, int]]:
        """
        Find if a message with the same text hash already exists.
        
        Args:
            text_hash: MD5 hash of message text
            
        Returns:
            Tuple of (channel_id, message_id) if duplicate found, None otherwise
        """
        if not text_hash:
            return None
            
        async with self.connection.execute(
            """SELECT channel_id, message_id 
               FROM messages 
               WHERE text_hash = ? AND is_duplicate = 0
               LIMIT 1""",
            (text_hash,)
        ) as cursor:
            row = await cursor.fetchone()
            if row:
                return (row['channel_id'], row['message_id'])
            return None
            
    async def batch_find_duplicates(self, text_hashes: List[str]) -> Dict[str, Tuple[int, int]]:
        """
        Find duplicates for multiple text hashes in a single query.
        
        Args:
            text_hashes: List of MD5 hashes
            
        Returns:
            Dictionary mapping hash to (channel_id, message_id)
        """
        if not text_hashes:
            return {}
            
        # Create placeholders for SQL IN clause
        placeholders = ','.join('?' * len(text_hashes))
        
        async with self.connection.execute(
            f"""SELECT text_hash, channel_id, message_id 
                FROM messages 
                WHERE text_hash IN ({placeholders}) AND is_duplicate = 0""",
            text_hashes
        ) as cursor:
            rows = await cursor.fetchall()
            return {row['text_hash']: (row['channel_id'], row['message_id']) for row in rows}
            
    async def insert_message(
        self,
        channel_id: int,
        message_id: int,
        message_text: Optional[str],
        message_datetime: str,
        has_media: bool = False,
        is_duplicate: bool = False,
        is_forwarded: bool = False,
        duplicate_of_channel_id: Optional[int] = None,
        duplicate_of_message_id: Optional[int] = None,
        forward_from_channel_id: Optional[int] = None,
        forward_from_message_id: Optional[int] = None,
        text_hash: Optional[str] = None,
        grouped_id: Optional[int] = None
    ):
        """
        Insert a new message into the database.
        
        Args:
            channel_id: Telegram channel ID
            message_id: Telegram message ID
            message_text: Message text (None for duplicates, forwards, or photo-only)
            message_datetime: ISO 8601 datetime string
            has_media: Whether message has photo
            is_duplicate: Whether this is a duplicate message
            is_forwarded: Whether this is a forwarded message
            duplicate_of_channel_id: Channel ID of original message (if duplicate)
            duplicate_of_message_id: Message ID of original message (if duplicate)
            forward_from_channel_id: Telegram channel ID of forwarded source
            forward_from_message_id: Message ID in forwarded source channel
            text_hash: MD5 hash of message text
            grouped_id: Telegram's grouped_id for media albums
        """
        await self.connection.execute(
            """INSERT OR IGNORE INTO messages 
               (channel_id, message_id, message_text, message_datetime, 
                has_media, is_duplicate, is_forwarded, duplicate_of_channel_id, duplicate_of_message_id,
                forward_from_channel_id, forward_from_message_id, text_hash, grouped_id)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                channel_id, message_id, message_text, message_datetime,
                1 if has_media else 0, 1 if is_duplicate else 0, 1 if is_forwarded else 0,
                duplicate_of_channel_id, duplicate_of_message_id,
                forward_from_channel_id, forward_from_message_id,
                text_hash, grouped_id
            )
        )
        await self.connection.commit()
        
    async def bulk_insert_messages(self, messages: List[Dict]):
        """
        Insert multiple messages in a single transaction.
        
        Args:
            messages: List of message dictionaries
        """
        if not messages:
            return
            
        await self.connection.executemany(
            """INSERT OR IGNORE INTO messages 
               (channel_id, message_id, message_text, message_datetime, 
                has_media, is_duplicate, is_forwarded, duplicate_of_channel_id, duplicate_of_message_id,
                forward_from_channel_id, forward_from_message_id, text_hash, grouped_id)
               VALUES (:channel_id, :message_id, :message_text, :message_datetime,
                       :has_media, :is_duplicate, :is_forwarded, :duplicate_of_channel_id, :duplicate_of_message_id,
                       :forward_from_channel_id, :forward_from_message_id, :text_hash, :grouped_id)""",
            messages
        )
        await self.connection.commit()
        logger.info(f"Bulk inserted {len(messages)} messages")
        
    # ========================================================================
    # IMAGE OPERATIONS
    # ========================================================================
    
    async def image_exists(self, file_id: str) -> bool:
        """
        Check if an image with the given file_id already exists.
        
        Args:
            file_id: Telegram file ID
            
        Returns:
            True if image exists
        """
        async with self.connection.execute(
            "SELECT 1 FROM images WHERE file_id = ? LIMIT 1",
            (file_id,)
        ) as cursor:
            row = await cursor.fetchone()
            return row is not None
            
    async def insert_image(
        self,
        message_channel_id: int,
        message_message_id: int,
        file_id: str,
        file_path: str,
        original_size: int,
        compressed_size: int,
        width: int,
        height: int
    ):
        """
        Insert image metadata into the database.
        
        Args:
            message_channel_id: Channel ID of the message
            message_message_id: Message ID
            file_id: Telegram file ID
            file_path: Local file path
            original_size: Original file size in bytes
            compressed_size: Compressed file size in bytes
            width: Image width in pixels
            height: Image height in pixels
        """
        await self.connection.execute(
            """INSERT OR IGNORE INTO images 
               (message_channel_id, message_message_id, file_id, file_path,
                original_size, compressed_size, width, height)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (message_channel_id, message_message_id, file_id, file_path,
             original_size, compressed_size, width, height)
        )
        await self.connection.commit()
        logger.debug(f"Inserted image metadata: {file_id}")
