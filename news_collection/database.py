"""Database operations using PostgreSQL with asyncpg."""
import asyncpg
import hashlib
from typing import List, Dict, Optional, Tuple
from logger_config import logger
from config import Config


class Database:
    """PostgreSQL database operations."""
    
    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None
        
    async def connect(self):
        """Create database connection pool."""
        try:
            self.pool = await asyncpg.create_pool(
                host=Config.DB_HOST,
                port=Config.DB_PORT,
                database=Config.DB_NAME,
                user=Config.DB_USER,
                password=Config.DB_PASSWORD,
                min_size=Config.DB_MIN_POOL_SIZE,
                max_size=Config.DB_MAX_POOL_SIZE
            )
            logger.info(f"Connected to PostgreSQL database: {Config.DB_NAME}")
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            raise
            
    async def close(self):
        """Close database connection pool."""
        if self.pool:
            await self.pool.close()
            logger.info("Database connection pool closed")
            
    async def initialize_schema(self):
        """Initialize database schema from SQL file."""
        try:
            with open('schema_postgresql.sql', 'r', encoding='utf-8') as f:
                schema_sql = f.read()
            
            async with self.pool.acquire() as conn:
                await conn.execute(schema_sql)
            
            logger.info("Database schema initialized successfully")
        except FileNotFoundError:
            logger.error("schema_postgresql.sql file not found")
            raise
        except Exception as e:
            logger.error(f"Failed to initialize schema: {e}")
            raise
            
    # ========================================================================
    # CHANNEL OPERATIONS
    # ========================================================================
    
    async def get_all_channels(self) -> List[Dict]:
        """
        Fetch all channels from the database.
        
        Returns:
            List of channel dictionaries
        """
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(
                """SELECT telegram_channel_id as id, telegram_channel_id, name, display_name, 
                          category, last_fetched_datetime 
                   FROM channels"""
            )
            return [dict(row) for row in rows]
            
    async def update_channel_last_fetched(self, channel_id: int, datetime_obj):
        """
        Update the last_fetched_datetime for a channel.
        
        Args:
            channel_id: Telegram channel ID
            datetime_obj: datetime object (timezone-aware)
        """
        async with self.pool.acquire() as conn:
            await conn.execute(
                "UPDATE channels SET last_fetched_datetime = $1 WHERE telegram_channel_id = $2",
                datetime_obj, channel_id
            )
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
        async with self.pool.acquire() as conn:
            await conn.execute(
                """INSERT INTO channels 
                   (telegram_channel_id, name, display_name, category) 
                   VALUES ($1, $2, $3, $4)
                   ON CONFLICT (telegram_channel_id) DO NOTHING""",
                telegram_channel_id, name, display_name, category
            )
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
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(
                """SELECT id, pattern, rule_type, is_case_sensitive, description
                   FROM exclusion_rules
                   WHERE is_active = 1
                   ORDER BY id"""
            )
            return [dict(row) for row in rows]
            
    async def add_exclusion_rule(
        self,
        pattern: str,
        rule_type: str = 'contains',
        is_case_sensitive: bool = False,
        description: str = None
    ):
        """
        Add a new exclusion rule.
        
        Args:
            pattern: Pattern to match
            rule_type: 'exact' or 'contains'
            is_case_sensitive: Whether matching is case-sensitive
            description: Optional description
        """
        async with self.pool.acquire() as conn:
            await conn.execute(
                """INSERT INTO exclusion_rules 
                   (pattern, rule_type, is_case_sensitive, description)
                   VALUES ($1, $2, $3, $4)""",
                pattern, rule_type, 1 if is_case_sensitive else 0, description
            )
        logger.info(f"Added exclusion rule: {rule_type} - {pattern}")
        
    def should_exclude_message(self, message_text: str, rules: List[Dict]) -> bool:
        """
        Check if a message should be excluded based on rules.
        
        Args:
            message_text: Message text to check
            rules: List of exclusion rules
            
        Returns:
            True if message should be excluded
        """
        for rule in rules:
            pattern = rule['pattern']
            rule_type = rule['rule_type']
            is_case_sensitive = rule['is_case_sensitive']
            
            text_to_check = message_text if is_case_sensitive else message_text.lower()
            pattern_to_check = pattern if is_case_sensitive else pattern.lower()
            
            if rule_type == 'exact':
                if text_to_check == pattern_to_check:
                    return True
            elif rule_type == 'contains':
                if pattern_to_check in text_to_check:
                    return True
                    
        return False
        
    # ========================================================================
    # MESSAGE OPERATIONS
    # ========================================================================
    
    def calculate_text_hash(self, text: str) -> str:
        """
        Calculate MD5 hash of message text for duplicate detection.
        
        Args:
            text: Message text
            
        Returns:
            MD5 hash string
        """
        return hashlib.md5(text.encode('utf-8')).hexdigest()
        
    async def find_duplicate(self, text_hash: str) -> Optional[Tuple[int, int]]:
        """
        Find if a message with this text hash already exists.
        
        Args:
            text_hash: MD5 hash of message text
            
        Returns:
            Tuple of (channel_id, message_id) if duplicate found, None otherwise
        """
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                """SELECT channel_id, message_id 
                   FROM messages 
                   WHERE text_hash = $1 AND is_duplicate = 0
                   LIMIT 1""",
                text_hash
            )
            return (row['channel_id'], row['message_id']) if row else None
            
    async def find_duplicates_batch(self, text_hashes: List[str]) -> Dict[str, Tuple[int, int]]:
        """
        Find duplicates for multiple text hashes in a single query.
        
        Args:
            text_hashes: List of MD5 hashes
            
        Returns:
            Dictionary mapping hash to (channel_id, message_id)
        """
        if not text_hashes:
            return {}
            
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(
                """SELECT text_hash, channel_id, message_id
                   FROM messages
                   WHERE text_hash = ANY($1) AND is_duplicate = 0""",
                text_hashes
            )
            return {row['text_hash']: (row['channel_id'], row['message_id']) for row in rows}
            
    async def insert_message(
        self,
        channel_id: int,
        message_id: int,
        message_text: Optional[str],
        message_datetime,  # datetime object
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
            message_datetime: datetime object (timezone-aware)
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
        async with self.pool.acquire() as conn:
            await conn.execute(
                """INSERT INTO messages 
                   (channel_id, message_id, message_text, message_datetime, 
                    has_media, is_duplicate, is_forwarded, duplicate_of_channel_id, duplicate_of_message_id,
                    forward_from_channel_id, forward_from_message_id, text_hash, grouped_id)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                   ON CONFLICT (channel_id, message_id) DO NOTHING""",
                channel_id, message_id, message_text, message_datetime,
                1 if has_media else 0, 1 if is_duplicate else 0, 1 if is_forwarded else 0,
                duplicate_of_channel_id, duplicate_of_message_id,
                forward_from_channel_id, forward_from_message_id,
                text_hash, grouped_id
            )
        
    async def bulk_insert_messages(self, messages: List[Dict]):
        """
        Insert multiple messages in a single transaction.
        
        Args:
            messages: List of message dictionaries
        """
        if not messages:
            return
            
        async with self.pool.acquire() as conn:
            await conn.executemany(
                """INSERT INTO messages 
                   (channel_id, message_id, message_text, message_datetime, 
                    has_media, is_duplicate, is_forwarded, duplicate_of_channel_id, duplicate_of_message_id,
                    forward_from_channel_id, forward_from_message_id, text_hash, grouped_id)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                   ON CONFLICT (channel_id, message_id) DO NOTHING""",
                [(m['channel_id'], m['message_id'], m['message_text'], m['message_datetime'],
                  m['has_media'], m['is_duplicate'], m['is_forwarded'], 
                  m.get('duplicate_of_channel_id'), m.get('duplicate_of_message_id'),
                  m.get('forward_from_channel_id'), m.get('forward_from_message_id'),
                  m.get('text_hash'), m.get('grouped_id')) for m in messages]
            )
        logger.info(f"Bulk inserted {len(messages)} messages")
        
    # ========================================================================
    # IMAGE OPERATIONS
    # ========================================================================
    
    async def image_exists(self, file_id: str) -> bool:
        """
        Check if an image already exists in the database.
        
        Args:
            file_id: Telegram file ID
            
        Returns:
            True if image exists
        """
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT 1 FROM images WHERE file_id = $1",
                file_id
            )
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
        async with self.pool.acquire() as conn:
            await conn.execute(
                """INSERT INTO images 
                   (message_channel_id, message_message_id, file_id, file_path,
                    original_size, compressed_size, width, height)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                   ON CONFLICT (file_id) DO NOTHING""",
                message_channel_id, message_message_id, file_id, file_path,
                original_size, compressed_size, width, height
            )
        logger.debug(f"Inserted image metadata: {file_id}")
