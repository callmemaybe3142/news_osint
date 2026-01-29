"""
ACLED Data Cleanup Script
Safely deletes all ACLED data from the database with confirmation.
"""

import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def cleanup_acled_data():
    """Delete all ACLED data from database."""
    
    print("\n" + "="*60)
    print("ACLED Data Cleanup")
    print("="*60)
    print("\nWARNING: This will delete ALL data from ACLED tables:")
    print("  - acled_events")
    print("  - acled_actors")
    print("  - acled_sources")
    print("  - acled_event_actors")
    print("  - acled_event_sources")
    print("  - Materialized views will be refreshed (empty)")
    print()
    
    # Confirmation
    confirm = input("Are you sure you want to continue? (yes/no): ").strip().lower()
    
    if confirm != 'yes':
        print("\n✗ Cleanup cancelled")
        return
    
    print("\nConnecting to database...")
    
    try:
        # Connect to database
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=os.getenv('DB_PORT', '5432'),
            database=os.getenv('DB_NAME', 'osint_news'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', '')
        )
        cursor = conn.cursor()
        print("✓ Connected to database\n")
        
        # Get current counts
        print("Current data counts:")
        cursor.execute("""
            SELECT 'Events' as table_name, COUNT(*) as count FROM acled_events
            UNION ALL
            SELECT 'Actors', COUNT(*) FROM acled_actors
            UNION ALL
            SELECT 'Sources', COUNT(*) FROM acled_sources
            UNION ALL
            SELECT 'Event-Actors', COUNT(*) FROM acled_event_actors
            UNION ALL
            SELECT 'Event-Sources', COUNT(*) FROM acled_event_sources
        """)
        
        for row in cursor.fetchall():
            print(f"  {row[0]:<15} {row[1]:>10,}")
        
        print("\nDeleting data...")
        
        # Disable foreign key checks temporarily
        cursor.execute("SET session_replication_role = 'replica'")
        
        # Delete data from junction tables first
        cursor.execute("TRUNCATE TABLE acled_event_actors CASCADE")
        print("  ✓ Deleted event-actor links")
        
        cursor.execute("TRUNCATE TABLE acled_event_sources CASCADE")
        print("  ✓ Deleted event-source links")
        
        # Delete main event data
        cursor.execute("TRUNCATE TABLE acled_events CASCADE")
        print("  ✓ Deleted events")
        
        # Delete normalized data
        cursor.execute("TRUNCATE TABLE acled_actors CASCADE")
        print("  ✓ Deleted actors")
        
        cursor.execute("TRUNCATE TABLE acled_sources CASCADE")
        print("  ✓ Deleted sources")
        
        # Re-enable foreign key checks
        cursor.execute("SET session_replication_role = 'origin'")
        
        # Reset sequences
        print("\nResetting ID sequences...")
        cursor.execute("ALTER SEQUENCE acled_events_event_id_seq RESTART WITH 1")
        cursor.execute("ALTER SEQUENCE acled_actors_actor_id_seq RESTART WITH 1")
        cursor.execute("ALTER SEQUENCE acled_sources_source_id_seq RESTART WITH 1")
        cursor.execute("ALTER SEQUENCE acled_event_actors_id_seq RESTART WITH 1")
        print("  ✓ Sequences reset")
        
        # Refresh materialized views
        print("\nRefreshing materialized views...")
        cursor.execute("REFRESH MATERIALIZED VIEW acled_monthly_event_summary")
        cursor.execute("REFRESH MATERIALIZED VIEW acled_actor_event_summary")
        print("  ✓ Materialized views refreshed")
        
        # Commit changes
        conn.commit()
        
        # Verify deletion
        print("\nVerifying deletion...")
        cursor.execute("""
            SELECT 'Events' as table_name, COUNT(*) as count FROM acled_events
            UNION ALL
            SELECT 'Actors', COUNT(*) FROM acled_actors
            UNION ALL
            SELECT 'Sources', COUNT(*) FROM acled_sources
            UNION ALL
            SELECT 'Event-Actors', COUNT(*) FROM acled_event_actors
            UNION ALL
            SELECT 'Event-Sources', COUNT(*) FROM acled_event_sources
        """)
        
        all_zero = True
        for row in cursor.fetchall():
            print(f"  {row[0]:<15} {row[1]:>10,}")
            if row[1] > 0:
                all_zero = False
        
        if all_zero:
            print("\n" + "="*60)
            print("✓ All ACLED data has been deleted successfully!")
            print("="*60)
        else:
            print("\n⚠ Warning: Some data may still remain")
        
        # Close connection
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"\n✗ Cleanup failed: {e}")
        if 'conn' in locals():
            conn.rollback()
        raise


if __name__ == '__main__':
    try:
        cleanup_acled_data()
    except KeyboardInterrupt:
        print("\n\n✗ Cleanup interrupted by user")
    except Exception as e:
        print(f"\n✗ Error: {e}")
