"""Helper script to generate Telegram session string."""
from telethon import TelegramClient
from telethon.sessions import StringSession


def generate_session():
    """
    Generate a Telegram session string for use with the collector.
    
    This script will:
    1. Ask for your API_ID and API_HASH
    2. Send you a login code via Telegram
    3. Generate a session string that you can use in .env file
    """
    print("=" * 80)
    print("TELEGRAM SESSION STRING GENERATOR")
    print("=" * 80)
    print("\nThis script will help you generate a session string for the collector.")
    print("You'll need your API_ID and API_HASH from https://my.telegram.org/apps")
    print("\n" + "=" * 80 + "\n")
    
    # Get credentials
    api_id = input("Enter your API_ID: ").strip()
    api_hash = input("Enter your API_HASH: ").strip()
    
    if not api_id or not api_hash:
        print("\n❌ Error: API_ID and API_HASH are required!")
        return
    
    try:
        api_id = int(api_id)
    except ValueError:
        print("\n❌ Error: API_ID must be a number!")
        return
    
    print("\n" + "=" * 80)
    print("Connecting to Telegram...")
    print("=" * 80 + "\n")
    
    # Create client and generate session
    with TelegramClient(StringSession(), api_id, api_hash) as client:
        print("\n" + "=" * 80)
        print("✅ Successfully connected to Telegram!")
        print("=" * 80 + "\n")
        
        session_string = client.session.save()
        
        print("Your session string:")
        print("-" * 80)
        print(session_string)
        print("-" * 80)
        
        print("\n📋 Next steps:")
        print("1. Copy the session string above")
        print("2. Open your .env file")
        print("3. Set SESSION_STRING=<paste_session_string_here>")
        print("\nExample .env entry:")
        print(f"SESSION_STRING={session_string}")
        print("\n" + "=" * 80)
        print("✅ Session generation complete!")
        print("=" * 80 + "\n")


if __name__ == "__main__":
    try:
        generate_session()
    except KeyboardInterrupt:
        print("\n\n❌ Cancelled by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nPlease check your API credentials and try again.")