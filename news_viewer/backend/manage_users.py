"""
User management script
Add users to the database with hashed passwords and role-based access
"""
import asyncio
import asyncpg
import getpass
from auth_utils import hash_password
from config import settings


# Role definitions
ROLES = {
    0: "Basic User (News only)",
    1: "Advanced User",
    2: "Admin (Person data access)",
    3: "Super Admin"
}


async def add_user(username: str, password: str, role: int = 0):
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
        
        # Insert user with role
        await conn.execute(
            "INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)",
            username,
            password_hash,
            role
        )
        
        print(f"✅ User '{username}' created successfully with role {role} ({ROLES.get(role, 'Custom')})")
        await conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


async def update_password(username: str, new_password: str):
    """Update password for an existing user"""
    try:
        # Connect to database
        conn = await asyncpg.connect(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            database=settings.DB_NAME,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD
        )
        
        # Check if user exists
        existing_user = await conn.fetchrow(
            "SELECT id, username FROM users WHERE username = $1",
            username
        )
        
        if not existing_user:
            print(f"❌ User '{username}' not found!")
            await conn.close()
            return False
        
        # Hash new password
        password_hash = hash_password(new_password)
        
        # Update password
        await conn.execute(
            "UPDATE users SET password_hash = $1 WHERE username = $2",
            password_hash,
            username
        )
        
        print(f"✅ Password updated successfully for user '{username}'!")
        await conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


async def update_role(username: str, new_role: int):
    """Update role for an existing user"""
    try:
        # Connect to database
        conn = await asyncpg.connect(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            database=settings.DB_NAME,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD
        )
        
        # Check if user exists
        existing_user = await conn.fetchrow(
            "SELECT id, username, role FROM users WHERE username = $1",
            username
        )
        
        if not existing_user:
            print(f"❌ User '{username}' not found!")
            await conn.close()
            return False
        
        old_role = existing_user['role']
        
        # Update role
        await conn.execute(
            "UPDATE users SET role = $1 WHERE username = $2",
            new_role,
            username
        )
        
        print(f"✅ Role updated successfully for user '{username}'!")
        print(f"   Old role: {old_role} ({ROLES.get(old_role, 'Custom')})")
        print(f"   New role: {new_role} ({ROLES.get(new_role, 'Custom')})")
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
            "SELECT id, username, role, created_at, last_login FROM users ORDER BY id"
        )
        
        if not users:
            print("No users found in database.")
        else:
            print("\n📋 Users in database:")
            print("-" * 100)
            print(f"{'ID':<5} {'Username':<20} {'Role':<5} {'Role Name':<30} {'Created At':<25} {'Last Login':<25}")
            print("-" * 100)
            for user in users:
                last_login = user['last_login'].strftime('%Y-%m-%d %H:%M:%S') if user['last_login'] else 'Never'
                created_at = user['created_at'].strftime('%Y-%m-%d %H:%M:%S')
                role_name = ROLES.get(user['role'], 'Custom')
                print(f"{user['id']:<5} {user['username']:<20} {user['role']:<5} {role_name:<30} {created_at:<25} {last_login:<25}")
            print("-" * 100)
        
        await conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")


async def main():
    """Main function"""
    print("=" * 60)
    print("User Management Script - News Viewer (RBAC)")
    print("=" * 60)
    print("\n📌 Role Levels:")
    for role_num, role_desc in ROLES.items():
        print(f"   {role_num}: {role_desc}")
    print("\n" + "=" * 60)
    print("\n1. Add new user")
    print("2. Update user password")
    print("3. Update user role")
    print("4. List all users")
    print("5. Exit")
    
    choice = input("\nEnter your choice (1-5): ").strip()
    
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
        
        print("\nSelect role:")
        for role_num, role_desc in ROLES.items():
            print(f"  {role_num}: {role_desc}")
        
        role_input = input("Enter role number (default 0): ").strip()
        role = int(role_input) if role_input.isdigit() else 0
        
        await add_user(username, password, role)
        
    elif choice == "2":
        print("\n--- Update User Password ---")
        username = input("Enter username: ").strip()
        
        if not username:
            print("❌ Username cannot be empty!")
            return
        
        new_password = getpass.getpass("Enter new password: ")
        password_confirm = getpass.getpass("Confirm new password: ")
        
        if new_password != password_confirm:
            print("❌ Passwords do not match!")
            return
        
        if len(new_password) < 6:
            print("❌ Password must be at least 6 characters long!")
            return
        
        await update_password(username, new_password)
        
    elif choice == "3":
        print("\n--- Update User Role ---")
        username = input("Enter username: ").strip()
        
        if not username:
            print("❌ Username cannot be empty!")
            return
        
        print("\nAvailable roles:")
        for role_num, role_desc in ROLES.items():
            print(f"  {role_num}: {role_desc}")
        
        role_input = input("Enter new role number: ").strip()
        
        if not role_input.isdigit():
            print("❌ Invalid role number!")
            return
        
        new_role = int(role_input)
        await update_role(username, new_role)
        
    elif choice == "4":
        await list_users()
        
    elif choice == "5":
        print("Goodbye!")
        return
    else:
        print("❌ Invalid choice!")


if __name__ == "__main__":
    asyncio.run(main())
