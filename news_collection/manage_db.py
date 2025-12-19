"""Helper script for managing channels and exclusion rules."""
import asyncio
import sys
from database import Database
from logger_config import logger


class DatabaseManager:
    """Manage database entries for channels and exclusion rules."""
    
    def __init__(self):
        self.db = Database()
        
    async def initialize(self):
        """Initialize database connection."""
        await self.db.connect()
        await self.db.initialize_schema()
        
    async def cleanup(self):
        """Close database connection."""
        await self.db.close()
        
    async def add_channel_with_telegram_info(
        self, 
        name: str, 
        display_name: str = None, 
        category: str = None
    ):
        """
        Add a new channel by fetching info from Telegram.
        
        Args:
            name: Channel username
            display_name: Human-readable name (will be fetched from Telegram if not provided)
            category: Channel category
        """
        from telethon import TelegramClient
        from telethon.sessions import StringSession
        from telethon.errors import ChannelPrivateError, UsernameNotOccupiedError
        from config import Config
        
        # Create Telegram client
        client = TelegramClient(
            StringSession(Config.SESSION_STRING),
            Config.API_ID,
            Config.API_HASH
        )
        
        try:
            await client.connect()
            
            # Fetch channel entity from Telegram
            try:
                entity = await client.get_entity(name)
                
                # Get Telegram channel ID
                telegram_channel_id = entity.id
                
                # Get display name from Telegram if not provided
                if not display_name:
                    display_name = entity.title if hasattr(entity, 'title') else name
                
                # Check if user is a participant (has joined the channel)
                try:
                    participant = await client.get_permissions(entity)
                    if not participant:
                        logger.info(
                            f"ℹ️  Note: You haven't joined channel '@{name}'. "
                            f"This is fine for public channels."
                        )
                        print(f"\nℹ️  Note: You haven't joined '@{name}'")
                        print(f"   This is fine for public channels - you can still collect messages.")
                        print(f"   Only join if you want notifications or if collection fails.\n")
                except Exception:
                    # If we can't check permissions, assume it's okay
                    pass
                
                # Add to database
                await self.db.add_channel(
                    name=name,
                    telegram_channel_id=telegram_channel_id,
                    display_name=display_name,
                    category=category
                )
                
                logger.info(
                    f"✓ Added channel: {name} (ID: {telegram_channel_id}, "
                    f"Display: {display_name})"
                )
                print(f"\n✓ Successfully added channel:")
                print(f"   Username: @{name}")
                print(f"   Telegram ID: {telegram_channel_id}")
                print(f"   Display Name: {display_name}")
                if category:
                    print(f"   Category: {category}")
                print()
                
            except ChannelPrivateError:
                logger.error(f"❌ Channel '@{name}' is private or you haven't joined it!")
                print(f"\n❌ ERROR: Channel '@{name}' is private or you haven't joined it!")
                print(f"   Please join the channel in Telegram first.\n")
                
            except UsernameNotOccupiedError:
                logger.error(f"❌ Channel '@{name}' does not exist!")
                print(f"\n❌ ERROR: Channel '@{name}' does not exist!\n")
                
            except Exception as e:
                logger.error(f"❌ Error fetching channel info: {e}")
                print(f"\n❌ ERROR: Could not fetch channel info: {e}\n")
                
        finally:
            await client.disconnect()
    
    async def add_channel(self, name: str, display_name: str = None, category: str = None):
        """Add a new channel (wrapper for backward compatibility)."""
        await self.add_channel_with_telegram_info(name, display_name, category)
        
    async def list_channels(self):
        """List all channels."""
        channels = await self.db.get_all_channels()
        
        if not channels:
            print("\nNo channels found in database.\n")
            return
            
        print(f"\n{'='*100}")
        print(f"{'ID':<5} {'Telegram ID':<15} {'Name':<20} {'Display Name':<30} {'Category':<15}")
        print(f"{'='*100}")
        
        for channel in channels:
            telegram_id = str(channel.get('telegram_channel_id') or 'N/A')
            print(
                f"{channel['id']:<5} "
                f"{telegram_id:<15} "
                f"{channel['name']:<20} "
                f"{(channel['display_name'] or ''):<30} "
                f"{(channel['category'] or ''):<15}"
            )
        
        print(f"{'='*100}")
        print(f"Total: {len(channels)} channels\n")
        
    async def add_exclusion_rule(
        self,
        pattern: str,
        rule_type: str = 'contains',
        is_case_sensitive: bool = False,
        description: str = None
    ):
        """Add a new exclusion rule."""
        await self.db.add_exclusion_rule(pattern, rule_type, is_case_sensitive, description)
        logger.info(f"✓ Added exclusion rule: {rule_type} - {pattern}")
        
    async def list_exclusion_rules(self):
        """List all active exclusion rules."""
        rules = await self.db.get_active_exclusion_rules()
        
        if not rules:
            print("\nNo exclusion rules found in database.\n")
            return
            
        print(f"\n{'='*80}")
        print(f"{'Type':<10} {'Case':<10} {'Pattern':<60}")
        print(f"{'='*80}")
        
        for rule in rules:
            case_sensitive = "Yes" if rule['is_case_sensitive'] else "No"
            print(
                f"{rule['rule_type']:<10} "
                f"{case_sensitive:<10} "
                f"{rule['pattern']:<60}"
            )
        
        print(f"{'='*80}")
        print(f"Total: {len(rules)} active rules\n")


async def interactive_menu():
    """Interactive menu for database management."""
    manager = DatabaseManager()
    await manager.initialize()
    
    try:
        while True:
            print("\n" + "="*80)
            print("DATABASE MANAGER")
            print("="*80)
            print("1. Add Channel")
            print("2. List Channels")
            print("3. Add Exclusion Rule")
            print("4. List Exclusion Rules")
            print("5. Exit")
            print("="*80)
            
            choice = input("\nEnter your choice (1-5): ").strip()
            
            if choice == '1':
                print("\n--- Add Channel ---")
                name = input("Channel username (without @): ").strip()
                display_name = input("Display name (optional): ").strip() or None
                category = input("Category (optional): ").strip() or None
                
                if name:
                    await manager.add_channel(name, display_name, category)
                else:
                    print("❌ Channel name is required!")
                    
            elif choice == '2':
                await manager.list_channels()
                
            elif choice == '3':
                print("\n--- Add Exclusion Rule ---")
                pattern = input("Pattern to exclude: ").strip()
                
                print("\nRule type:")
                print("1. Exact match")
                print("2. Contains (default)")
                rule_type_choice = input("Enter choice (1-2): ").strip()
                rule_type = 'exact' if rule_type_choice == '1' else 'contains'
                
                case_choice = input("Case sensitive? (y/N): ").strip().lower()
                is_case_sensitive = case_choice == 'y'
                
                description = input("Description (optional): ").strip() or None
                
                if pattern:
                    await manager.add_exclusion_rule(
                        pattern,
                        rule_type,
                        is_case_sensitive,
                        description
                    )
                else:
                    print("❌ Pattern is required!")
                    
            elif choice == '4':
                await manager.list_exclusion_rules()
                
            elif choice == '5':
                print("\nGoodbye!\n")
                break
                
            else:
                print("\n❌ Invalid choice. Please enter 1-5.")
                
    finally:
        await manager.cleanup()


async def quick_add_channels():
    """Quick add example channels."""
    manager = DatabaseManager()
    await manager.initialize()
    
    try:
        # Example channels (modify as needed)
        channels = [
            {
                'name': 'nugmyanmar',
                'display_name': 'National Unity Government of Myanmar',
                'category': 'Politics'
            },
            {
                'name': 'itvisionchannel',
                'display_name': 'IT Vision',
                'category': 'Technology'
            }
        ]
        
        print("\nAdding example channels...")
        for channel in channels:
            await manager.add_channel(**channel)
            
        print("\n✓ Example channels added successfully!\n")
        await manager.list_channels()
        
    finally:
        await manager.cleanup()


async def quick_add_exclusion_rules():
    """Quick add example exclusion rules."""
    manager = DatabaseManager()
    await manager.initialize()
    
    try:
        # Example exclusion rules (modify as needed)
        rules = [
            {
                'pattern': 'Join our premium channel',
                'rule_type': 'exact',
                'is_case_sensitive': False,
                'description': 'Premium channel spam'
            },
            {
                'pattern': 'Subscribe now',
                'rule_type': 'contains',
                'is_case_sensitive': False,
                'description': 'Subscription spam'
            },
            {
                'pattern': 'ကြော်ငြာ',  # Advertisement in Burmese
                'rule_type': 'contains',
                'is_case_sensitive': False,
                'description': 'Burmese advertisement'
            }
        ]
        
        print("\nAdding example exclusion rules...")
        for rule in rules:
            await manager.add_exclusion_rule(**rule)
            
        print("\n✓ Example exclusion rules added successfully!\n")
        await manager.list_exclusion_rules()
        
    finally:
        await manager.cleanup()


def print_usage():
    """Print usage information."""
    print("""
Usage: python manage_db.py [command]

Commands:
    interactive         Open interactive menu (default)
    list-channels       List all channels
    list-rules          List all exclusion rules
    add-examples        Add example channels
    add-rule-examples   Add example exclusion rules

Examples:
    python manage_db.py
    python manage_db.py list-channels
    python manage_db.py add-examples
    """)


async def main():
    """Main entry point."""
    args = sys.argv[1:]
    
    if not args or args[0] == 'interactive':
        await interactive_menu()
    elif args[0] == 'list-channels':
        manager = DatabaseManager()
        await manager.initialize()
        await manager.list_channels()
        await manager.cleanup()
    elif args[0] == 'list-rules':
        manager = DatabaseManager()
        await manager.initialize()
        await manager.list_exclusion_rules()
        await manager.cleanup()
    elif args[0] == 'add-examples':
        await quick_add_channels()
    elif args[0] == 'add-rule-examples':
        await quick_add_exclusion_rules()
    else:
        print(f"Unknown command: {args[0]}")
        print_usage()


if __name__ == "__main__":
    asyncio.run(main())
