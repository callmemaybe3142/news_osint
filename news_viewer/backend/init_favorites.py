import asyncio
from database import db
from config import settings

async def init_favorites_table():
    print("Connecting to database...")
    await db.connect()
    
    print("Creating user_favorites table...")
    try:
        query = """
        CREATE TABLE IF NOT EXISTS user_favorites (
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            news_id INTEGER NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, news_id)
        );
        
        COMMENT ON TABLE user_favorites IS 'Stores user favorite/bookmarked news items';
        """
        await db.execute(query)
        print("✅ user_favorites table created successfully!")
    except Exception as e:
        print(f"❌ Error creating table: {e}")
    finally:
        await db.disconnect()

if __name__ == "__main__":
    asyncio.run(init_favorites_table())
