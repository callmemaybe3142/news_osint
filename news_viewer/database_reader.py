"""Database reader for the news viewer - PostgreSQL version."""
import asyncpg
from typing import List, Dict, Optional, Tuple
from pathlib import Path
import asyncio


class DatabaseReader:
    """Read-only database access for the news viewer using PostgreSQL."""
    
    def __init__(self, db_config: Dict = None):
        """
        Initialize database reader.
        
        Args:
            db_config: Dictionary with PostgreSQL connection parameters
                      {host, port, database, user, password}
        """
        self.db_config = db_config or {
            'host': 'localhost',
            'port': 5432,
            'database': 'news_collection',
            'user': 'postgres',
            'password': ''
        }
        self.pool: Optional[asyncpg.Pool] = None
        
    async def connect(self):
        """Connect to the database."""
        try:
            self.pool = await asyncpg.create_pool(
                host=self.db_config['host'],
                port=self.db_config['port'],
                database=self.db_config['database'],
                user=self.db_config['user'],
                password=self.db_config['password'],
                min_size=2,
                max_size=10
            )
        except Exception as e:
            raise ConnectionError(f"Failed to connect to PostgreSQL: {e}")
        
    async def close(self):
        """Close database connection."""
        if self.pool:
            await self.pool.close()
            
    async def get_statistics(self) -> Dict:
        """Get overall statistics."""
        async with self.pool.acquire() as conn:
            # Total messages
            total_messages = await conn.fetchval("SELECT COUNT(*) FROM messages")
            
            # Original messages (non-duplicates)
            original_messages = await conn.fetchval(
                "SELECT COUNT(*) FROM messages WHERE is_duplicate = 0"
            )
            
            # Duplicate messages
            duplicate_messages = await conn.fetchval(
                "SELECT COUNT(*) FROM messages WHERE is_duplicate = 1"
            )
            
            # Messages with images
            messages_with_images = await conn.fetchval(
                "SELECT COUNT(*) FROM messages WHERE has_media = 1"
            )
            
            # Total images
            total_images = await conn.fetchval("SELECT COUNT(*) FROM images")
            
            # Total channels
            total_channels = await conn.fetchval("SELECT COUNT(*) FROM channels")
            
            return {
                'total_messages': total_messages,
                'original_messages': original_messages,
                'duplicate_messages': duplicate_messages,
                'messages_with_images': messages_with_images,
                'total_images': total_images,
                'total_channels': total_channels
            }
            
    async def get_channels(self) -> List[Dict]:
        """Get all channels."""
        async with self.pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT 
                    c.telegram_channel_id,
                    c.name,
                    c.display_name,
                    c.category,
                    COUNT(m.message_id) as message_count
                FROM channels c
                LEFT JOIN messages m ON c.telegram_channel_id = m.channel_id
                GROUP BY c.telegram_channel_id, c.name, c.display_name, c.category
                ORDER BY c.display_name
            """)
            return [dict(row) for row in rows]
            
    async def get_messages(
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
        async with self.pool.acquire() as conn:
            # Build query
            where_clauses = []
            params = []
            param_count = 0
            
            if channel_id:
                param_count += 1
                where_clauses.append(f"m.channel_id = ${param_count}")
                params.append(channel_id)
                
            if not show_duplicates:
                where_clauses.append("m.is_duplicate = 0")
                
            if search_text:
                param_count += 1
                where_clauses.append(f"m.message_text ILIKE ${param_count}")
                params.append(f"%{search_text}%")
            
            where_sql = " AND ".join(where_clauses) if where_clauses else "1=1"
            
            # Get total count
            count_query = f"""
                SELECT COUNT(*) 
                FROM messages m
                WHERE {where_sql}
            """
            total_count = await conn.fetchval(count_query, *params)
            
            # Get messages
            param_count += 1
            limit_param = param_count
            param_count += 1
            offset_param = param_count
            
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
                LIMIT ${limit_param} OFFSET ${offset_param}
            """
            params.extend([limit, offset])
            rows = await conn.fetch(query, *params)
            messages = [dict(row) for row in rows]
            
            return messages, total_count
            
    async def get_message_images(self, channel_id: int, message_id: int) -> List[Dict]:
        """Get images for a specific message."""
        async with self.pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT 
                    file_id,
                    file_path,
                    original_size,
                    compressed_size,
                    width,
                    height
                FROM images
                WHERE message_channel_id = $1 AND message_message_id = $2
            """, channel_id, message_id)
            return [dict(row) for row in rows]
            
    async def get_original_message(self, channel_id: int, message_id: int) -> Optional[Dict]:
        """Get the original message for a duplicate."""
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT 
                    m.channel_id,
                    m.message_id,
                    m.message_text,
                    m.message_datetime,
                    c.name as channel_name,
                    c.display_name as channel_display_name
                FROM messages m
                JOIN channels c ON m.channel_id = c.telegram_channel_id
                WHERE m.channel_id = $1 AND m.message_id = $2
            """, channel_id, message_id)
            return dict(row) if row else None


# Synchronous wrapper for Tkinter compatibility
class SyncDatabaseReader:
    """Synchronous wrapper for DatabaseReader to work with Tkinter."""
    
    def __init__(self, db_config: Dict = None):
        self.db_config = db_config
        self.reader = DatabaseReader(db_config)
        self.loop = None
        
    def connect(self):
        """Connect to database."""
        self.loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self.loop)
        self.loop.run_until_complete(self.reader.connect())
        
    def close(self):
        """Close database connection."""
        if self.loop:
            self.loop.run_until_complete(self.reader.close())
            self.loop.close()
            
    def get_statistics(self) -> Dict:
        """Get statistics."""
        return self.loop.run_until_complete(self.reader.get_statistics())
        
    def get_channels(self) -> List[Dict]:
        """Get channels."""
        return self.loop.run_until_complete(self.reader.get_channels())
        
    def get_messages(
        self,
        channel_id: Optional[int] = None,
        show_duplicates: bool = True,
        search_text: str = "",
        offset: int = 0,
        limit: int = 50
    ) -> Tuple[List[Dict], int]:
        """Get messages."""
        return self.loop.run_until_complete(
            self.reader.get_messages(channel_id, show_duplicates, search_text, offset, limit)
        )
        
    def get_message_images(self, channel_id: int, message_id: int) -> List[Dict]:
        """Get message images."""
        return self.loop.run_until_complete(
            self.reader.get_message_images(channel_id, message_id)
        )
        
    def get_original_message(self, channel_id: int, message_id: int) -> Optional[Dict]:
        """Get original message."""
        return self.loop.run_until_complete(
            self.reader.get_original_message(channel_id, message_id)
        )
