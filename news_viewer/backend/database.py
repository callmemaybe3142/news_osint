"""
Database connection and pool management
"""
import asyncpg
from config import settings


class Database:
    """Database connection pool manager"""
    
    def __init__(self):
        self.pool = None
    
    async def connect(self):
        """Create database connection pool"""
        self.pool = await asyncpg.create_pool(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            database=settings.DB_NAME,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            min_size=5,
            max_size=20
        )
        print("✅ Database pool created")
    
    async def disconnect(self):
        """Close database connection pool"""
        if self.pool:
            await self.pool.close()
            print("✅ Database pool closed")
    
    async def fetch_one(self, query: str, *args):
        """Fetch single row"""
        async with self.pool.acquire() as connection:
            return await connection.fetchrow(query, *args)
    
    async def fetch_all(self, query: str, *args):
        """Fetch multiple rows"""
        async with self.pool.acquire() as connection:
            return await connection.fetch(query, *args)
    
    async def execute(self, query: str, *args):
        """Execute query without return"""
        async with self.pool.acquire() as connection:
            return await connection.execute(query, *args)


# Global database instance
db = Database()
