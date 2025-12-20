"""Image handling: download, compression, and deduplication."""
import os
from pathlib import Path
from typing import Optional, Tuple
from PIL import Image
import io
from config import Config
from logger_config import logger


class ImageHandler:
    """Handles image download, compression, and storage."""
    
    def __init__(self, base_dir: str = None):
        """
        Initialize image handler.
        
        Args:
            base_dir: Base directory for storing images
        """
        self.base_dir = Path(base_dir or Config.IMAGE_DIR)
        self.max_width = Config.MAX_IMAGE_WIDTH
        self.quality = Config.IMAGE_QUALITY
        
    def get_image_dir(self, message_datetime, channel_name: str) -> Path:
        """
        Get or create directory for an image based on date and channel.
        Structure: YYYY/MM/DD/ChannelName
        
        Args:
            message_datetime: Message datetime object
            channel_name: Channel username
            
        Returns:
            Path to image directory
        """
        # Extract date components
        year = message_datetime.strftime('%Y')
        month = message_datetime.strftime('%m')
        day = message_datetime.strftime('%d')
        
        # Create path: images/2025/01/16/channelname/
        image_dir = self.base_dir / year / month / day / channel_name
        image_dir.mkdir(parents=True, exist_ok=True)
        return image_dir
        
    def get_file_path(self, message_datetime, channel_name: str, file_id: str, extension: str = "jpg") -> Path:
        """
        Generate file path for an image with date-based organization.
        
        Args:
            message_datetime: Message datetime object
            channel_name: Channel username
            file_id: Telegram file ID
            extension: File extension
            
        Returns:
            Path to image file (e.g., images/2025/01/16/channelname/12345.jpg)
        """
        # Sanitize file_id to be filesystem-safe
        safe_file_id = "".join(c if c.isalnum() or c in "-_" else "_" for c in file_id)
        filename = f"{safe_file_id}.{extension}"
        return self.get_image_dir(message_datetime, channel_name) / filename
        
    async def download_and_compress_photo(
        self,
        client,
        message,
        channel_name: str,
        file_id: str
    ) -> Optional[Tuple[str, int, int, int, int]]:
        """
        Download and compress a photo from Telegram.
        
        Args:
            client: Telethon client
            message: Telegram message object
            channel_name: Channel username
            file_id: Telegram file ID
            
        Returns:
            Tuple of (file_path, original_size, compressed_size, width, height) or None if failed
        """
        try:
            # Download photo to memory
            photo_bytes = await client.download_media(message.photo, file=bytes)
            
            if not photo_bytes:
                logger.warning(f"Failed to download photo: {file_id}")
                return None
                
            original_size = len(photo_bytes)
            
            # Open image with Pillow
            img = Image.open(io.BytesIO(photo_bytes))
            original_width, original_height = img.size
            
            # Determine file extension based on format
            img_format = img.format.lower() if img.format else 'jpeg'
            
            # Keep WebP as-is, compress others
            if img_format == 'webp' and Config.KEEP_WEBP:
                extension = 'webp'
                should_compress = False
            else:
                # Convert to JPEG for compression
                extension = 'jpg'
                should_compress = True
                if img.mode in ('RGBA', 'LA', 'P'):
                    # Convert to RGB for JPEG
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'P':
                        img = img.convert('RGBA')
                    background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
                    img = background
                elif img.mode != 'RGB':
                    img = img.convert('RGB')
            

            # Resize if needed
            if original_width > self.max_width:
                ratio = self.max_width / original_width
                new_height = int(original_height * ratio)
                img = img.resize((self.max_width, new_height), Image.Resampling.LANCZOS)
                logger.debug(f"Resized image from {original_width}x{original_height} to {self.max_width}x{new_height}")
            
            # Get file path with date-based organization
            file_path = self.get_file_path(message.date, channel_name, file_id, extension)
            
            # Save compressed image
            if should_compress:
                img.save(
                    file_path,
                    'JPEG',
                    quality=self.quality,
                    optimize=True
                )
            else:
                # Save WebP as-is
                img.save(file_path, 'WEBP')
            
            compressed_size = file_path.stat().st_size
            final_width, final_height = img.size
            
            # Calculate compression ratio
            compression_ratio = (1 - compressed_size / original_size) * 100
            logger.info(
                f"Saved image: {file_path.name} | "
                f"Original: {original_size/1024:.1f}KB | "
                f"Compressed: {compressed_size/1024:.1f}KB | "
                f"Saved: {compression_ratio:.1f}% | "
                f"Size: {final_width}x{final_height}"
            )
            
            return (
                str(file_path.relative_to(self.base_dir)),
                original_size,
                compressed_size,
                final_width,
                final_height
            )
            
        except Exception as e:
            logger.error(f"Error processing image {file_id}: {e}", exc_info=True)
            return None
            
    def cleanup_orphaned_images(self):
        """
        Remove image files that are not referenced in the database.
        This should be run periodically as maintenance.
        """
        # TODO: Implement cleanup logic
        # This would require querying the database for all file_paths
        # and removing files that don't exist in the database
        pass
