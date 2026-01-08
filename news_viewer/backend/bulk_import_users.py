"""
Bulk user import script
Import multiple users from a text file
File format: username,password (one per line)
"""
import asyncio
import asyncpg
from pathlib import Path
from auth_utils import hash_password
from config import settings


async def import_users_from_file(file_path: str):
    """Import users from a text file"""
    
    # Check if file exists
    if not Path(file_path).exists():
        print(f"❌ File not found: {file_path}")
        return
    
    # Read file
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except Exception as e:
        print(f"❌ Error reading file: {e}")
        return
    
    # Parse users
    users_to_add = []
    line_number = 0
    
    for line in lines:
        line_number += 1
        line = line.strip()
        
        # Skip empty lines and comments
        if not line or line.startswith('#'):
            continue
        
        # Parse username,password
        parts = line.split(',')
        if len(parts) != 2:
            print(f"⚠️  Line {line_number}: Invalid format (expected: username,password) - Skipping")
            continue
        
        username = parts[0].strip()
        password = parts[1].strip()
        
        # Validate username
        if not username or len(username) < 3:
            print(f"⚠️  Line {line_number}: Username '{username}' too short (min 3 chars) - Skipping")
            continue
        
        # Validate password
        if not password or len(password) < 6:
            print(f"⚠️  Line {line_number}: Password for '{username}' too short (min 6 chars) - Skipping")
            continue
        
        users_to_add.append((username, password))
    
    if not users_to_add:
        print("❌ No valid users found in file!")
        return
    
    print(f"\n📋 Found {len(users_to_add)} valid user(s) to import")
    print("-" * 60)
    
    # Connect to database
    try:
        conn = await asyncpg.connect(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            database=settings.DB_NAME,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD
        )
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        return
    
    # Import users
    success_count = 0
    skip_count = 0
    error_count = 0
    
    for username, password in users_to_add:
        try:
            # Check if user already exists
            existing_user = await conn.fetchrow(
                "SELECT username FROM users WHERE username = $1",
                username
            )
            
            if existing_user:
                print(f"⏭️  '{username}' - Already exists, skipping")
                skip_count += 1
                continue
            
            # Hash password
            password_hash = hash_password(password)
            
            # Insert user
            await conn.execute(
                "INSERT INTO users (username, password_hash) VALUES ($1, $2)",
                username,
                password_hash
            )
            
            print(f"✅ '{username}' - Created successfully")
            success_count += 1
            
        except Exception as e:
            print(f"❌ '{username}' - Error: {e}")
            error_count += 1
    
    await conn.close()
    
    # Summary
    print("-" * 60)
    print(f"\n📊 Import Summary:")
    print(f"   ✅ Successfully created: {success_count}")
    print(f"   ⏭️  Skipped (already exists): {skip_count}")
    print(f"   ❌ Errors: {error_count}")
    print(f"   📝 Total processed: {len(users_to_add)}")


async def main():
    """Main function"""
    print("=" * 60)
    print("Bulk User Import - News Viewer")
    print("=" * 60)
    print("\nFile format: username,password (one per line)")
    print("Example:")
    print("  john,mypassword123")
    print("  jane,securepass456")
    print("  # This is a comment (lines starting with # are ignored)")
    print("\nNotes:")
    print("  - Username must be at least 3 characters")
    print("  - Password must be at least 6 characters")
    print("  - Empty lines are ignored")
    print("  - Existing users will be skipped")
    print("=" * 60)
    
    file_path = input("\nEnter the path to the users file: ").strip()
    
    if not file_path:
        print("❌ File path cannot be empty!")
        return
    
    # Confirm before importing
    print(f"\n⚠️  About to import users from: {file_path}")
    confirm = input("Continue? (yes/no): ").strip().lower()
    
    if confirm not in ['yes', 'y']:
        print("❌ Import cancelled")
        return
    
    print("\n🚀 Starting import...\n")
    await import_users_from_file(file_path)
    print("\n✨ Import completed!")


if __name__ == "__main__":
    asyncio.run(main())
