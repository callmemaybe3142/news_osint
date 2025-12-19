"""Database reader for the news viewer."""
import sqlite3
from typing import List, Dict, Optional, Tuple
from pathlib import Path
import config


class DatabaseReader:
    """Read-only database access for the news viewer."""
    
    def __init__(self, db_path: str = None):
        """Initialize database reader."""
        self.db_path = db_path or config.DATABASE_PATH
        self.connection: Optional[sqlite3.Connection] = None
        
    def connect(self):
        """Connect to the database."""
        db_file = Path(self.db_path)
        if not db_file.exists():
            raise FileNotFoundError(f"Database not found: {self.db_path}")
        
        self.connection = sqlite3.connect(self.db_path)
        self.connection.row_factory = sqlite3.Row
        
    def close(self):
        """Close database connection."""
        if self.connection:
            self.connection.close()
            
    def get_statistics(self) -> Dict:
        """Get overall statistics."""
        cursor = self.connection.cursor()
        
        # Total messages
        cursor.execute("SELECT COUNT(*) as count FROM messages")
        total_messages = cursor.fetchone()['count']
        
        # Original messages (non-duplicates)
        cursor.execute("SELECT COUNT(*) as count FROM messages WHERE is_duplicate = 0")
        original_messages = cursor.fetchone()['count']
        
        # Duplicate messages
        cursor.execute("SELECT COUNT(*) as count FROM messages WHERE is_duplicate = 1")
        duplicate_messages = cursor.fetchone()['count']
        
        # Messages with images
        cursor.execute("SELECT COUNT(*) as count FROM messages WHERE has_media = 1")
        messages_with_images = cursor.fetchone()['count']
        
        # Total images
        cursor.execute("SELECT COUNT(*) as count FROM images")
        total_images = cursor.fetchone()['count']
        
        # Total channels
        cursor.execute("SELECT COUNT(*) as count FROM channels")
        total_channels = cursor.fetchone()['count']
        
        return {
            'total_messages': total_messages,
            'original_messages': original_messages,
            'duplicate_messages': duplicate_messages,
            'messages_with_images': messages_with_images,
            'total_images': total_images,
            'total_channels': total_channels
        }
        
    def get_channels(self) -> List[Dict]:
        """Get all channels."""
        cursor = self.connection.cursor()
        cursor.execute("""
            SELECT 
                c.telegram_channel_id,
                c.name,
                c.display_name,
                c.category,
                COUNT(m.message_id) as message_count
            FROM channels c
            LEFT JOIN messages m ON c.telegram_channel_id = m.channel_id
            GROUP BY c.telegram_channel_id
            ORDER BY c.display_name
        """)
        return [dict(row) for row in cursor.fetchall()]
        
    def get_messages(
        self,
        channel_id: Optional[int] = None,
        show_duplicates: bool = True,
        search_text: str = "",
        offset: int = 0,
        limit: int = 50
    ) -> Tuple[List[Dict], int]:
        """
        Get messages with filters.
        
        Returns:
            Tuple of (messages, total_count)
        """
        cursor = self.connection.cursor()
        
        # Build query
        where_clauses = []
        params = []
        
        if channel_id:
            where_clauses.append("m.channel_id = ?")
            params.append(channel_id)
            
        if not show_duplicates:
            where_clauses.append("m.is_duplicate = 0")
            
        if search_text:
            where_clauses.append("m.message_text LIKE ?")
            params.append(f"%{search_text}%")
        
        where_sql = " AND ".join(where_clauses) if where_clauses else "1=1"
        
        # Get total count
        count_query = f"""
            SELECT COUNT(*) as count
            FROM messages m
            WHERE {where_sql}
        """
        cursor.execute(count_query, params)
        total_count = cursor.fetchone()['count']
        
        # Get messages
        query = f"""
            SELECT 
                m.channel_id,
                m.message_id,
                m.message_text,
                m.message_datetime,
                m.has_media,
                m.is_duplicate,
                m.duplicate_of_channel_id,
                m.duplicate_of_message_id,
                m.grouped_id,
                c.name as channel_name,
                c.display_name as channel_display_name
            FROM messages m
            JOIN channels c ON m.channel_id = c.telegram_channel_id
            WHERE {where_sql}
            ORDER BY m.message_datetime DESC
            LIMIT ? OFFSET ?
        """
        params.extend([limit, offset])
        cursor.execute(query, params)
        messages = [dict(row) for row in cursor.fetchall()]
        
        return messages, total_count
        
    def get_message_images(self, channel_id: int, message_id: int) -> List[Dict]:
        """Get images for a specific message."""
        cursor = self.connection.cursor()
        cursor.execute("""
            SELECT 
                file_id,
                file_path,
                original_size,
                compressed_size,
                width,
                height
            FROM images
            WHERE message_channel_id = ? AND message_message_id = ?
        """, (channel_id, message_id))
        return [dict(row) for row in cursor.fetchall()]
        
    def get_original_message(self, channel_id: int, message_id: int) -> Optional[Dict]:
        """Get the original message for a duplicate."""
        cursor = self.connection.cursor()
        cursor.execute("""
            SELECT 
                m.channel_id,
                m.message_id,
                m.message_text,
                m.message_datetime,
                c.name as channel_name,
                c.display_name as channel_display_name
            FROM messages m
            JOIN channels c ON m.channel_id = c.telegram_channel_id
            WHERE m.channel_id = ? AND m.message_id = ?
        """, (channel_id, message_id))
        row = cursor.fetchone()
        return dict(row) if row else None
