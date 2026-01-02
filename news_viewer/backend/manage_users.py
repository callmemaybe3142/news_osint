"""
User management script
Add users to the database with hashed passwords
"""
import asyncio
import asyncpg
import getpass
from auth_utils import hash_password
from config import settings


async def add_user(username: str, password: str):
    """Add a new user to the database"""
    try:
        # Connect to database
        conn = await asyncpg.connect(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            database=settings.DB_NAME,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD
        )
        
        # Check if user already exists
        existing_user = await conn.fetchrow(
            "SELECT username FROM users WHERE username = $1",
            username
        )
        
        if existing_user:
            print(f"❌ User '{username}' already exists!")
            await conn.close()
            return False
        
        # Hash password
        password_hash = hash_password(password)
        
        # Insert user
        await conn.execute(
            "INSERT INTO users (username, password_hash) VALUES ($1, $2)",
            username,
            password_hash
        )
        
        print(f"✅ User '{username}' created successfully!")
        await conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


async def list_users():
    """List all users in the database"""
    try:
        conn = await asyncpg.connect(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            database=settings.DB_NAME,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD
        )
        
        users = await conn.fetch(
            "SELECT id, username, created_at, last_login FROM users ORDER BY id"
        )
        
        if not users:
            print("No users found in database.")
        else:
            print("\n📋 Users in database:")
            print("-" * 80)
            print(f"{'ID':<5} {'Username':<20} {'Created At':<25} {'Last Login':<25}")
            print("-" * 80)
            for user in users:
                last_login = user['last_login'].strftime('%Y-%m-%d %H:%M:%S') if user['last_login'] else 'Never'
                created_at = user['created_at'].strftime('%Y-%m-%d %H:%M:%S')
                print(f"{user['id']:<5} {user['username']:<20} {created_at:<25} {last_login:<25}")
            print("-" * 80)
        
        await conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")


async def main():
    """Main function"""
    print("=" * 60)
    print("User Management Script - News Viewer")
    print("=" * 60)
    print("\n1. Add new user")
    print("2. List all users")
    print("3. Exit")
    
    choice = input("\nEnter your choice (1-3): ").strip()
    
    if choice == "1":
        print("\n--- Add New User ---")
        username = input("Enter username: ").strip()
        
        if not username or len(username) < 3:
            print("❌ Username must be at least 3 characters long!")
            return
        
        password = getpass.getpass("Enter password: ")
        password_confirm = getpass.getpass("Confirm password: ")
        
        if password != password_confirm:
            print("❌ Passwords do not match!")
            return
        
        if len(password) < 6:
            print("❌ Password must be at least 6 characters long!")
            return
        
        await add_user(username, password)
        
    elif choice == "2":
        await list_users()
        
    elif choice == "3":
        print("Goodbye!")
        return
    else:
        print("❌ Invalid choice!")


if __name__ == "__main__":
    asyncio.run(main())
