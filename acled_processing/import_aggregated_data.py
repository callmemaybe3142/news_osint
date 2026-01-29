"""
Import ACLED aggregated weekly data from Excel file into PostgreSQL database.

This script reads aggregated ACLED data from an Excel file, filters for Myanmar,
and imports it into the acled_aggregated table.

Usage:
    python import_aggregated_data.py --file data/aggregated-2026-01-10.xlsx
    python import_aggregated_data.py --file data/aggregated-2026-01-10.xlsx --start-date 2024-01-01
"""

import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
import argparse
import os
import json
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# State file to track last import date
STATE_FILE = Path(__file__).parent / '.last_import_state.json'

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'osint_news'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', '')
}

def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description='Import ACLED aggregated weekly data for Myanmar into PostgreSQL'
    )
    parser.add_argument(
        '--file',
        required=True,
        help='Path to the Excel file containing aggregated data'
    )
    parser.add_argument(
        '--start-date',
        help='Start date to filter data (format: YYYY-MM-DD). If not specified, uses last import date from state file.'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Preview data without inserting into database'
    )
    parser.add_argument(
        '--force-all',
        action='store_true',
        help='Import all data, ignoring saved state (use with caution)'
    )
    return parser.parse_args()

def load_last_import_state():
    """
    Load the last import state from file.
    
    Returns:
        dict with 'last_week' or None if file doesn't exist
    """
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE, 'r') as f:
                state = json.load(f)
                return state
        except Exception as e:
            print(f"⚠️  Warning: Could not load state file: {e}")
            return None
    return None

def save_last_import_state(last_week):
    """
    Save the last import state to file.
    
    Args:
        last_week: datetime.date object of the last imported week
    """
    try:
        state = {
            'last_week': last_week.isoformat(),
            'last_import_timestamp': datetime.now().isoformat()
        }
        with open(STATE_FILE, 'w') as f:
            json.dump(state, f, indent=2)
        print(f"\n💾 Saved last import date: {last_week}")
    except Exception as e:
        print(f"⚠️  Warning: Could not save state file: {e}")

def read_excel_data(file_path, start_date=None):
    """
    Read Excel file and filter for Myanmar data.
    
    Args:
        file_path: Path to Excel file
        start_date: Optional start date to filter data (YYYY-MM-DD)
    
    Returns:
        DataFrame with filtered Myanmar data
    """
    print(f"\n{'='*80}")
    print(f"Reading Excel file: {file_path}")
    print(f"{'='*80}")
    
    # Read Excel file
    df = pd.read_excel(file_path, sheet_name='Sheet1', engine='openpyxl')
    
    print(f"Total rows in file: {len(df):,}")
    print(f"Columns: {df.columns.tolist()}")
    
    # Filter for Myanmar
    myanmar_df = df[df['COUNTRY'] == 'Myanmar'].copy()
    print(f"\nMyanmar rows: {len(myanmar_df):,}")
    
    if len(myanmar_df) == 0:
        print("⚠️  No Myanmar data found in the file!")
        return None
    
    # Convert WEEK column to datetime
    myanmar_df['WEEK'] = pd.to_datetime(myanmar_df['WEEK'], format='%d-%B-%Y')
    
    # Filter by start date if specified
    if start_date:
        start_dt = pd.to_datetime(start_date)
        myanmar_df = myanmar_df[myanmar_df['WEEK'] >= start_dt]
        print(f"Rows after filtering by start date ({start_date}): {len(myanmar_df):,}")
    
    # Select only the columns we need
    columns_to_keep = [
        'WEEK', 'ADMIN1', 'EVENT_TYPE', 'SUB_EVENT_TYPE',
        'EVENTS', 'FATALITIES', 'POPULATION_EXPOSURE', 'DISORDER_TYPE'
    ]
    
    myanmar_df = myanmar_df[columns_to_keep].copy()
    
    # Handle missing values
    myanmar_df['EVENTS'] = myanmar_df['EVENTS'].fillna(0).astype(int)
    myanmar_df['FATALITIES'] = myanmar_df['FATALITIES'].fillna(0).astype(int)
    myanmar_df['POPULATION_EXPOSURE'] = myanmar_df['POPULATION_EXPOSURE'].fillna(0).astype(int)
    
    # Sort by week
    myanmar_df = myanmar_df.sort_values('WEEK')
    
    print(f"\n{'='*80}")
    print("Data Summary:")
    print(f"{'='*80}")
    print(f"Date range: {myanmar_df['WEEK'].min().date()} to {myanmar_df['WEEK'].max().date()}")
    print(f"Total events: {myanmar_df['EVENTS'].sum():,}")
    print(f"Total fatalities: {myanmar_df['FATALITIES'].sum():,}")
    print(f"Unique admin1 regions: {myanmar_df['ADMIN1'].nunique()}")
    print(f"Unique event types: {myanmar_df['EVENT_TYPE'].nunique()}")
    
    print(f"\n{'='*80}")
    print("Sample data (first 5 rows):")
    print(f"{'='*80}")
    print(myanmar_df.head().to_string())
    
    return myanmar_df

def insert_data(df, dry_run=False):
    """
    Insert data into PostgreSQL database.
    
    Args:
        df: DataFrame with Myanmar aggregated data
        dry_run: If True, only preview without inserting
    """
    if df is None or len(df) == 0:
        print("\n⚠️  No data to insert!")
        return
    
    print(f"\n{'='*80}")
    print(f"Database Connection")
    print(f"{'='*80}")
    print(f"Host: {DB_CONFIG['host']}")
    print(f"Database: {DB_CONFIG['database']}")
    print(f"User: {DB_CONFIG['user']}")
    
    if dry_run:
        print("\n🔍 DRY RUN MODE - No data will be inserted")
        print(f"\nWould insert {len(df):,} rows into acled_aggregated table")
        return
    
    # Confirm before inserting
    print(f"\n⚠️  About to insert {len(df):,} rows into the database")
    response = input("Continue? (yes/no): ").strip().lower()
    
    if response != 'yes':
        print("❌ Import cancelled by user")
        return
    
    try:
        # Connect to database
        print("\n📡 Connecting to database...")
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Prepare data for insertion
        print("📝 Preparing data for insertion...")
        
        # Convert DataFrame to list of tuples
        data_tuples = []
        for _, row in df.iterrows():
            data_tuples.append((
                row['WEEK'].date(),
                row['ADMIN1'],
                row['EVENT_TYPE'],
                row['SUB_EVENT_TYPE'],
                int(row['EVENTS']),
                int(row['FATALITIES']),
                int(row['POPULATION_EXPOSURE']),
                row['DISORDER_TYPE']
            ))
        
        # Insert data using ON CONFLICT DO NOTHING to skip duplicates
        insert_query = """
            INSERT INTO acled_aggregated (
                week, admin1, event_type, sub_event_type,
                events, fatalities, population_exposure, disorder_type
            ) VALUES %s
            ON CONFLICT (week, admin1, event_type, sub_event_type) DO NOTHING
        """
        
        print("💾 Inserting data into database...")
        execute_values(cursor, insert_query, data_tuples)
        
        # Get number of rows inserted
        rows_inserted = cursor.rowcount
        
        # Commit transaction
        conn.commit()
        
        print(f"\n{'='*80}")
        print("✅ Import completed successfully!")
        print(f"{'='*80}")
        print(f"Rows processed: {len(df):,}")
        print(f"Rows inserted: {rows_inserted:,}")
        print(f"Rows skipped (duplicates): {len(df) - rows_inserted:,}")
        
        # Get summary statistics
        cursor.execute("""
            SELECT 
                COUNT(*) as total_rows,
                MIN(week) as earliest_week,
                MAX(week) as latest_week,
                SUM(events) as total_events,
                SUM(fatalities) as total_fatalities
            FROM acled_aggregated
        """)
        
        stats = cursor.fetchone()
        
        print(f"\n{'='*80}")
        print("Database Statistics (Myanmar data):")
        print(f"{'='*80}")
        print(f"Total rows in database: {stats[0]:,}")
        print(f"Date range: {stats[1]} to {stats[2]}")
        print(f"Total events: {stats[3]:,}")
        print(f"Total fatalities: {stats[4]:,}")
        
        # Save the last imported week for next run
        if rows_inserted > 0:
            last_week = df['WEEK'].max().date()
            save_last_import_state(last_week)
        
        # Close connection
        cursor.close()
        conn.close()
        
    except psycopg2.Error as e:
        print(f"\n❌ Database error: {e}")
        if conn:
            conn.rollback()
    except Exception as e:
        print(f"\n❌ Error: {e}")
    finally:
        if conn:
            conn.close()

def main():
    """Main execution function."""
    args = parse_arguments()
    
    print(f"\n{'='*80}")
    print("ACLED Aggregated Data Import for Myanmar")
    print(f"{'='*80}")
    print(f"File: {args.file}")
    
    # Determine start_date to use
    start_date = None
    
    if args.force_all:
        print("Mode: FORCE ALL - Importing all data (ignoring saved state)")
        start_date = None
    elif args.start_date:
        print(f"Start date filter (user-specified): {args.start_date}")
        start_date = args.start_date
    else:
        # Try to load last import state
        state = load_last_import_state()
        if state and 'last_week' in state:
            last_week = state['last_week']
            last_import_time = state.get('last_import_timestamp', 'unknown')
            print(f"📅 Found previous import state:")
            print(f"   Last imported week: {last_week}")
            print(f"   Last import time: {last_import_time}")
            print(f"   Using incremental import from: {last_week}")
            start_date = last_week
        else:
            print("ℹ️  No previous import state found - importing all data")
            start_date = None
    
    if args.dry_run:
        print("Mode: DRY RUN (preview only)")
    
    # Check if file exists
    if not os.path.exists(args.file):
        print(f"\n❌ Error: File not found: {args.file}")
        return
    
    # Read and filter data
    df = read_excel_data(args.file, start_date)
    
    if df is not None:
        # Insert data
        insert_data(df, dry_run=args.dry_run)

if __name__ == "__main__":
    main()
