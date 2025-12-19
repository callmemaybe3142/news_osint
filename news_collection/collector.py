"""Main collector script for Telegram news messages and photos."""
import asyncio
from datetime import datetime, timezone
from typing import List, Dict, Optional, Tuple
from telethon import TelegramClient
from telethon.sessions import StringSession
from telethon.tl.types import MessageMediaPhoto

from config import Config
from database import Database
from image_handler import ImageHandler
from logger_config import logger


def has_photo(message) -> bool:
    """
    Check if a message has a photo (single or in a media group).
    
    Args:
        message: Telethon message object
        
    Returns:
        True if message has photo
    """
    return isinstance(message.media, MessageMediaPhoto)


class NewsCollector:
    """Collects news messages and photos from Telegram channels."""
    
    def __init__(self):
        """Initialize the news collector."""
        self.config = Config
        self.db = Database()
        self.image_handler = ImageHandler()
        self.client: Optional[TelegramClient] = None
        self.exclusion_rules: List[Dict] = []
        
    async def initialize(self):
        """Initialize database and load exclusion rules."""
        await self.db.connect()
        await self.db.initialize_schema()
        
        # Load exclusion rules
        self.exclusion_rules = await self.db.get_active_exclusion_rules()
        logger.info(f"Loaded {len(self.exclusion_rules)} active exclusion rules")
        
    async def cleanup(self):
        """Cleanup resources."""
        await self.db.close()
        
    def should_collect_message(self, message) -> Tuple[bool, str]:
        """
        Determine if a message should be collected based on filtering rules.
        
        Args:
            message: Telethon message object
            
        Returns:
            Tuple of (should_collect, reason)
        """
        # NOTE: We now COLLECT forwarded messages (don't skip them)
        # They will be handled specially in process_message()
            
        # Check if message has photo
        message_has_photo = has_photo(message)
        
        # Get message text (could be caption for photos)
        message_text = message.text or ""
        text_length = len(message_text)
        
        # Check exclusion rules
        if message_text and self.db.should_exclude_message(message_text, self.exclusion_rules):
            return False, "matched exclusion rule"
        
        # Rule: If message has photo, always collect (regardless of text length)
        if message_has_photo:
            return True, "has photo"
            
        # Rule: If message has video/file but text < MIN_TEXT_LENGTH, skip
        if message.media and not message_has_photo:
            if text_length < self.config.MIN_TEXT_LENGTH:
                return False, f"has media but text too short ({text_length} < {self.config.MIN_TEXT_LENGTH})"
            return True, "has media with sufficient text"
            
        # Rule: Text-only messages must have >= MIN_TEXT_LENGTH characters
        if text_length < self.config.MIN_TEXT_LENGTH:
            return False, f"text too short ({text_length} < {self.config.MIN_TEXT_LENGTH})"
            
        return True, "text message with sufficient length"
        
    async def process_message(
        self,
        message,
        channel_id: int,
        channel_name: str
    ) -> Optional[Dict]:
        """
        Process a single message and prepare it for database insertion.
        
        Args:
            message: Telethon message object
            channel_id: Telegram channel ID
            channel_name: Channel username
            
        Returns:
            Dictionary with message data or None if message should be skipped
        """
        # Check if message should be collected
        should_collect, reason = self.should_collect_message(message)
        
        if not should_collect:
            logger.debug(f"Skipping message {message.id}: {reason}")
            return None
            
        
        # Extract message data
        message_text = message.text or ""
        message_datetime = message.date  # Keep as datetime object for PostgreSQL
        message_has_photo = has_photo(message)
        grouped_id = message.grouped_id if message.grouped_id else None
        
        # Check if this is a forwarded message
        is_forwarded = message.fwd_from is not None
        forward_from_channel_id = None
        forward_from_message_id = None
        
        if is_forwarded:
            # Extract forward information
            if message.fwd_from.from_id:
                # Try to get channel ID from forward source
                try:
                    from telethon.tl.types import PeerChannel
                    if isinstance(message.fwd_from.from_id, PeerChannel):
                        forward_from_channel_id = message.fwd_from.from_id.channel_id
                except Exception as e:
                    logger.warning(f"Could not extract forward channel ID: {e}")
            
            # Get original message ID if available
            if hasattr(message.fwd_from, 'channel_post') and message.fwd_from.channel_post:
                forward_from_message_id = message.fwd_from.channel_post
            
            logger.info(
                f"Forwarded message detected: {message.id} from channel {forward_from_channel_id}, "
                f"message {forward_from_message_id}"
            )
            
            # For forwarded messages, don't store the text (set to None)
            message_text = None
        
        # Calculate text hash for duplicate detection (only for non-forwarded messages)
        text_hash = None
        is_duplicate = False
        duplicate_of_channel_id = None
        duplicate_of_message_id = None
        
        if not is_forwarded and message_text:
            text_hash = self.db.calculate_text_hash(message_text)
            duplicate = await self.db.find_duplicate(text_hash)
            if duplicate:
                is_duplicate = True
                duplicate_of_channel_id, duplicate_of_message_id = duplicate
                logger.info(
                    f"Duplicate text detected: Channel {channel_id}, Message {message.id} -> "
                    f"Original: Channel {duplicate_of_channel_id}, Message {duplicate_of_message_id}"
                )
                # For duplicates, don't store the text
                message_text = None
        
        # Prepare message data
        message_data = {
            'channel_id': channel_id,
            'message_id': message.id,
            'message_text': message_text,
            'message_datetime': message_datetime,
            'has_media': 1 if message_has_photo else 0,
            'is_duplicate': 1 if is_duplicate else 0,
            'is_forwarded': 1 if is_forwarded else 0,
            'duplicate_of_channel_id': duplicate_of_channel_id,
            'duplicate_of_message_id': duplicate_of_message_id,
            'forward_from_channel_id': forward_from_channel_id,
            'forward_from_message_id': forward_from_message_id,
            'text_hash': text_hash,
            'grouped_id': grouped_id
        }
        
        # Insert message FIRST (before processing photo)
        # This ensures the foreign key constraint is satisfied when inserting images
        await self.db.insert_message(**message_data)
        
        # Handle photo if present
        # Skip photo download for forwarded messages (photo already exists in original channel)
        if message_has_photo and not is_forwarded:
            await self.process_single_photo(message, channel_id, channel_name)
        elif message_has_photo and is_forwarded:
            logger.debug(
                f"Skipping photo download for forwarded message {message.id} "
                f"(photo exists in original channel {forward_from_channel_id})"
            )
        
        return message_data
        
    async def process_single_photo(self, message, channel_id: int, channel_name: str):
        """
        Process a single photo from a message.
        
        Args:
            message: Telethon message object
            channel_id: Database channel ID
            channel_name: Channel username
        """
        file_id = message.photo.id
        
        # Check if image already exists
        if await self.db.image_exists(str(file_id)):
            logger.debug(f"Image already exists: {file_id}")
            return
            
        # Download and compress photo
        logger.info(f"Downloading photo: {file_id} (message {message.id})")
        image_data = await self.image_handler.download_and_compress_photo(
            self.client,
            message,
            channel_name,
            str(file_id)
        )
        
        if image_data:
            file_path, original_size, compressed_size, width, height = image_data
            
            # Store image metadata
            await self.db.insert_image(
                message_channel_id=channel_id,
                message_message_id=message.id,  # Each photo has its own message_id
                file_id=str(file_id),
                file_path=file_path,
                original_size=original_size,
                compressed_size=compressed_size,
                width=width,
                height=height
            )
        else:
            logger.warning(f"Failed to download image for message {message.id}")
        
    async def process_channel(self, channel_info: Dict):
        """
        Process all messages from a single channel.
        
        Args:
            channel_info: Channel information dictionary
        """
        channel_id = channel_info['id']
        channel_name = channel_info['name']
        last_fetched = channel_info.get('last_fetched_datetime')
        
        
        logger.info(f"Processing channel: {channel_name} (ID: {channel_id})")
        
        # Determine offset date for fetching
        if last_fetched:
            # Handle both datetime objects (PostgreSQL) and strings (SQLite)
            if isinstance(last_fetched, str):
                offset_date = datetime.fromisoformat(last_fetched).astimezone(timezone.utc)
            else:
                # It's already a datetime object
                offset_date = last_fetched.astimezone(timezone.utc)
            logger.info(f"Fetching messages since: {offset_date}")
        else:
            offset_date = self.config.START_DATE
            logger.info(f"First fetch, starting from: {offset_date}")
        
        # Collect messages
        latest_message_time = None
        processed_count = 0
        collected_count = 0
        
        try:
            async for message in self.client.iter_messages(
                channel_name,
                offset_date=offset_date,
                reverse=True
            ):
                processed_count += 1
                
                # Process message (this now inserts the message immediately)
                message_data = await self.process_message(message, channel_id, channel_name)
                
                if message_data:
                    collected_count += 1
                    latest_message_time = message_data['message_datetime']
                    
                    # Log progress every 10 messages
                    if collected_count % 10 == 0:
                        logger.info(f"Collected {collected_count} messages from {channel_name}")
            
            # Update last_fetched_datetime
            if latest_message_time:
                await self.db.update_channel_last_fetched(channel_id, latest_message_time)
                logger.info(f"Updated last_fetched_datetime to: {latest_message_time}")
            
            logger.info(
                f"Channel {channel_name} completed: "
                f"Processed {processed_count} messages, Collected {collected_count} messages"
            )
            
        except Exception as e:
            logger.error(f"Error processing channel {channel_name}: {e}", exc_info=True)
            
    async def run(self):
        """Main execution method."""
        try:
            # Validate configuration
            self.config.validate()
            
            # Initialize
            await self.initialize()
            
            # Create Telegram client
            self.client = TelegramClient(
                StringSession(self.config.SESSION_STRING),
                self.config.API_ID,
                self.config.API_HASH
            )
            
            async with self.client:
                logger.info("Connected to Telegram")
                
                # Fetch channels from database
                channels = await self.db.get_all_channels()
                
                if not channels:
                    logger.warning("No channels found in database. Please add channels first.")
                    return
                
                logger.info(f"Found {len(channels)} channels to process")
                
                # Process each channel
                for channel_info in channels:
                    await self.process_channel(channel_info)
                
                logger.info("Collection completed successfully")
                
        except Exception as e:
            logger.error(f"Fatal error in collector: {e}", exc_info=True)
            raise
        finally:
            await self.cleanup()


async def main():
    """Entry point for the collector."""
    logger.info("=" * 80)
    logger.info("Starting News Collector")
    logger.info("=" * 80)
    
    collector = NewsCollector()
    await collector.run()
    
    logger.info("=" * 80)
    logger.info("News Collector finished")
    logger.info("=" * 80)


if __name__ == "__main__":
    asyncio.run(main())
