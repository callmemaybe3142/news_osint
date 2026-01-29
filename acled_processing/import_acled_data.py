"""
ACLED Data Import Script - OPTIMIZED VERSION
Imports ACLED event data from CSV into PostgreSQL database with normalized actors and sources.
Uses bulk inserts for maximum performance.
"""

import os
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime
from typing import Dict, List, Set, Tuple, Optional
from dotenv import load_dotenv
import pandas as pd
import numpy as np
from tqdm import tqdm

# Load environment variables
load_dotenv()


class ACLEDImporter:
    """Handles importing ACLED CSV data into PostgreSQL database."""
    
    def __init__(self, csv_file_path: str):
        self.csv_file_path = csv_file_path
        self.conn = None
        self.cursor = None
        
        # Statistics
        self.stats = {
            'total_rows': 0,
            'events_inserted': 0,
            'actors_created': 0,
            'sources_created': 0,
            'errors': 0
        }
    
    def connect(self):
        """Establish database connection."""
        print("Connecting to PostgreSQL database...")
        try:
            self.conn = psycopg2.connect(
                host=os.getenv('DB_HOST', 'localhost'),
                port=os.getenv('DB_PORT', '5432'),
                database=os.getenv('DB_NAME', 'osint_news'),
                user=os.getenv('DB_USER', 'postgres'),
                password=os.getenv('DB_PASSWORD', '')
            )
            self.cursor = self.conn.cursor()
            print("✓ Connected to PostgreSQL database\n")
        except Exception as e:
            print(f"✗ Database connection failed: {e}")
            raise
    
    def close(self):
        """Close database connection."""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
        print("\n✓ Database connection closed")
    
    def load_csv(self) -> pd.DataFrame:
        """Load CSV file using pandas."""
        print(f"Loading CSV file: {self.csv_file_path}")
        print("This may take a moment for large files...")
        
        try:
            df = pd.read_csv(
                self.csv_file_path,
                encoding='utf-8-sig',
                low_memory=False
            )
            
            # Replace NaN with None for proper NULL handling
            df = df.where(pd.notnull(df), None)
            
            print(f"✓ Loaded {len(df):,} rows from CSV")
            print(f"✓ Columns: {', '.join(df.columns[:5])}...\n")
            
            return df
            
        except Exception as e:
            print(f"✗ Failed to load CSV: {e}")
            raise
    
    def parse_date(self, date_str) -> Optional[str]:
        """Parse date from various formats to yyyy-mm-dd."""
        if pd.isna(date_str) or date_str == '' or date_str is None:
            return None
        try:
            date_str = str(date_str).strip()
            
            # Try yyyy-mm-dd format first (ACLED standard)
            if '-' in date_str and len(date_str) == 10:
                date_obj = pd.to_datetime(date_str, format='%Y-%m-%d', errors='coerce')
                if not pd.isna(date_obj):
                    return date_obj.strftime('%Y-%m-%d')
            
            # Try m/d/yyyy format
            if '/' in date_str:
                date_obj = pd.to_datetime(date_str, format='%m/%d/%Y', errors='coerce')
                if not pd.isna(date_obj):
                    return date_obj.strftime('%Y-%m-%d')
            
            # Try generic parsing
            date_obj = pd.to_datetime(date_str, errors='coerce')
            if not pd.isna(date_obj):
                return date_obj.strftime('%Y-%m-%d')
                
            return None
        except:
            return None
    
    def prepare_events_batch(self, df: pd.DataFrame) -> List[Tuple]:
        """Prepare all events for batch insert."""
        print("Preparing events data...")
        events_data = []
        
        for idx, row in tqdm(df.iterrows(), total=len(df), desc="Processing events"):
            # Parse date
            event_date = self.parse_date(row.get('event_date'))
            if not event_date:
                continue
            
            # Helper functions
            def get_val(key):
                val = row.get(key)
                if pd.isna(val) or val == '':
                    return None
                return str(val).strip()
            
            def get_int(key):
                val = row.get(key)
                if pd.isna(val):
                    return None
                try:
                    return int(val)
                except:
                    return None
            
            def get_float(key):
                val = row.get(key)
                if pd.isna(val):
                    return None
                return float(val)
            
            def get_bool(val):
                if pd.isna(val):
                    return False
                return str(val).strip().lower() == 'civilian targeting'
            
            event_tuple = (
                str(row['event_id_cnty']),
                event_date,
                get_int('time_precision'),
                get_val('disorder_type'),
                get_val('event_type'),
                get_val('sub_event_type'),
                get_bool(row.get('civilian_targeting')),
                get_val('interaction'),
                get_val('admin1'),
                get_val('admin2'),
                get_val('admin3'),
                get_val('location'),
                get_float('latitude'),
                get_float('longitude'),
                get_int('geo_precision'),
                get_val('notes'),
                get_int('fatalities') or 0,
                get_val('tags'),
                get_int('population_1km'),
                get_int('population_2km'),
                get_int('population_5km'),
                get_int('population_best'),
                get_val('source_scale'),
                get_int('timestamp')
            )
            
            events_data.append(event_tuple)
        
        print(f"✓ Prepared {len(events_data):,} events\n")
        return events_data
    
    def collect_unique_actors_sources(self, df: pd.DataFrame) -> Tuple[Set[str], Set[str]]:
        """Collect all unique actors and sources from the dataframe."""
        print("Collecting unique actors and sources...")
        
        actors = set()
        sources = set()
        
        for idx, row in tqdm(df.iterrows(), total=len(df), desc="Scanning data"):
            # Collect actors
            for col in ['actor1', 'actor2']:
                val = row.get(col)
                if not pd.isna(val) and val:
                    actors.add(str(val).strip())
            
            # Collect associated actors
            for col in ['assoc_actor_1', 'assoc_actor_2']:
                val = row.get(col)
                if not pd.isna(val) and val:
                    for actor in str(val).split(';'):
                        actor = actor.strip()
                        if actor:
                            actors.add(actor)
            
            # Collect sources
            val = row.get('source')
            if not pd.isna(val) and val:
                for source in str(val).split(';'):
                    source = source.strip()
                    if source:
                        sources.add(source)
        
        print(f"✓ Found {len(actors):,} unique actors")
        print(f"✓ Found {len(sources):,} unique sources\n")
        
        return actors, sources
    
    def bulk_insert_actors(self, actors: Set[str]) -> Dict[str, int]:
        """Bulk insert actors and return mapping."""
        if not actors:
            return {}
        
        print(f"Inserting {len(actors):,} actors...")
        
        # Prepare data
        actor_data = [(actor,) for actor in actors]
        
        # Bulk insert
        execute_values(
            self.cursor,
            "INSERT INTO acled_actors (actor_name) VALUES %s ON CONFLICT (actor_name) DO NOTHING",
            actor_data
        )
        
        # Get all actor IDs
        self.cursor.execute("SELECT actor_id, actor_name FROM acled_actors")
        actor_map = {name: id for id, name in self.cursor.fetchall()}
        
        self.stats['actors_created'] = len(actors)
        print(f"✓ Inserted actors\n")
        
        return actor_map
    
    def bulk_insert_sources(self, sources: Set[str]) -> Dict[str, int]:
        """Bulk insert sources and return mapping."""
        if not sources:
            return {}
        
        print(f"Inserting {len(sources):,} sources...")
        
        # Prepare data
        source_data = [(source,) for source in sources]
        
        # Bulk insert
        execute_values(
            self.cursor,
            "INSERT INTO acled_sources (source_name) VALUES %s ON CONFLICT (source_name) DO NOTHING",
            source_data
        )
        
        # Get all source IDs
        self.cursor.execute("SELECT source_id, source_name FROM acled_sources")
        source_map = {name: id for id, name in self.cursor.fetchall()}
        
        self.stats['sources_created'] = len(sources)
        print(f"✓ Inserted sources\n")
        
        return source_map
    
    def bulk_insert_events(self, events_data: List[Tuple]):
        """Bulk insert events."""
        if not events_data:
            return
        
        print(f"Inserting {len(events_data):,} events...")
        
        execute_values(
            self.cursor,
            """
            INSERT INTO acled_events (
                event_id_cnty, event_date, time_precision, disorder_type, event_type,
                sub_event_type, civilian_targeting, interaction_code, admin1, admin2,
                admin3, location, latitude, longitude, geo_precision, notes, fatalities,
                tags, population_1km, population_2km, population_5km, population_best,
                source_scale, timestamp
            ) VALUES %s
            """,
            events_data
        )
        
        self.stats['events_inserted'] = len(events_data)
        print(f"✓ Inserted events\n")
    
    def link_actors_and_sources(self, df: pd.DataFrame, actor_map: Dict[str, int], source_map: Dict[str, int]):
        """Link actors and sources to events in bulk."""
        print("Linking actors and sources to events...")
        
        # Get event ID mapping
        self.cursor.execute("SELECT event_id, event_id_cnty FROM acled_events")
        event_map = {cnty_id: event_id for event_id, cnty_id in self.cursor.fetchall()}
        
        actor_links = []
        source_links = []
        
        for idx, row in tqdm(df.iterrows(), total=len(df), desc="Creating links"):
            event_id_cnty = str(row['event_id_cnty'])
            event_id = event_map.get(event_id_cnty)
            
            if not event_id:
                continue
            
            # Link actor1
            actor1 = row.get('actor1')
            if not pd.isna(actor1) and actor1:
                actor1 = str(actor1).strip()
                if actor1 in actor_map:
                    actor_links.append((event_id, actor_map[actor1], 1, False))
            
            # Link assoc_actor_1
            assoc1 = row.get('assoc_actor_1')
            if not pd.isna(assoc1) and assoc1:
                for actor in str(assoc1).split(';'):
                    actor = actor.strip()
                    if actor and actor in actor_map:
                        actor_links.append((event_id, actor_map[actor], 1, True))
            
            # Link actor2
            actor2 = row.get('actor2')
            if not pd.isna(actor2) and actor2:
                actor2 = str(actor2).strip()
                if actor2 in actor_map:
                    actor_links.append((event_id, actor_map[actor2], 2, False))
            
            # Link assoc_actor_2
            assoc2 = row.get('assoc_actor_2')
            if not pd.isna(assoc2) and assoc2:
                for actor in str(assoc2).split(';'):
                    actor = actor.strip()
                    if actor and actor in actor_map:
                        actor_links.append((event_id, actor_map[actor], 2, True))
            
            # Link sources
            sources = row.get('source')
            if not pd.isna(sources) and sources:
                for source in str(sources).split(';'):
                    source = source.strip()
                    if source and source in source_map:
                        source_links.append((event_id, source_map[source]))
        
        # Bulk insert actor links in batches
        if actor_links:
            batch_size = 10000
            total_batches = (len(actor_links) + batch_size - 1) // batch_size
            print(f"  Inserting {len(actor_links):,} actor links in {total_batches} batches...")
            
            for i in range(0, len(actor_links), batch_size):
                batch = actor_links[i:i + batch_size]
                execute_values(
                    self.cursor,
                    """
                    INSERT INTO acled_event_actors (event_id, actor_id, actor_role, is_associated)
                    VALUES %s ON CONFLICT DO NOTHING
                    """,
                    batch
                )
                # Commit each batch to avoid long transactions
                self.conn.commit()
                if (i // batch_size + 1) % 5 == 0:  # Progress every 5 batches
                    print(f"    Progress: {min(i + batch_size, len(actor_links)):,}/{len(actor_links):,} actor links")
        
        # Bulk insert source links in batches
        if source_links:
            batch_size = 10000
            total_batches = (len(source_links) + batch_size - 1) // batch_size
            print(f"  Inserting {len(source_links):,} source links in {total_batches} batches...")
            
            for i in range(0, len(source_links), batch_size):
                batch = source_links[i:i + batch_size]
                execute_values(
                    self.cursor,
                    "INSERT INTO acled_event_sources (event_id, source_id) VALUES %s ON CONFLICT DO NOTHING",
                    batch
                )
                # Commit each batch to avoid long transactions
                self.conn.commit()
                if (i // batch_size + 1) % 5 == 0:  # Progress every 5 batches
                    print(f"    Progress: {min(i + batch_size, len(source_links)):,}/{len(source_links):,} source links")
        
        print(f"✓ Linked actors and sources\n")
    
    def import_data(self):
        """Main import function."""
        print(f"\n{'='*60}")
        print(f"Starting ACLED Data Import (OPTIMIZED)")
        print(f"{'='*60}\n")
        
        try:
            # Load CSV
            df = self.load_csv()
            self.stats['total_rows'] = len(df)
            
            # Step 1: Collect unique actors and sources
            actors, sources = self.collect_unique_actors_sources(df)
            
            # Step 2: Bulk insert actors and sources
            actor_map = self.bulk_insert_actors(actors)
            source_map = self.bulk_insert_sources(sources)
            self.conn.commit()
            
            # Step 3: Prepare and insert events
            events_data = self.prepare_events_batch(df)
            self.bulk_insert_events(events_data)
            self.conn.commit()
            
            # Step 4: Link actors and sources to events
            self.link_actors_and_sources(df, actor_map, source_map)
            self.conn.commit()
            
            print(f"\n{'='*60}")
            print(f"Import Complete!")
            print(f"{'='*60}")
            print(f"Total rows processed:  {self.stats['total_rows']:,}")
            print(f"Events inserted:       {self.stats['events_inserted']:,}")
            print(f"Actors created:        {self.stats['actors_created']:,}")
            print(f"Sources created:       {self.stats['sources_created']:,}")
            print(f"Errors:                {self.stats['errors']:,}")
            print()
            
            # Refresh materialized views
            print("Refreshing materialized views...")
            self.cursor.execute("SELECT refresh_acled_views()")
            self.conn.commit()
            print("✓ Materialized views refreshed")
            
        except Exception as e:
            print(f"\n✗ Import failed: {e}")
            if self.conn:
                self.conn.rollback()
            raise


def main():
    """Main entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Import ACLED CSV data into PostgreSQL (OPTIMIZED)')
    parser.add_argument('csv_file', help='Path to ACLED CSV file')
    
    args = parser.parse_args()
    
    # Check if file exists
    if not os.path.exists(args.csv_file):
        print(f"Error: File not found: {args.csv_file}")
        return
    
    # Create importer and run
    importer = ACLEDImporter(args.csv_file)
    
    try:
        importer.connect()
        importer.import_data()
    except KeyboardInterrupt:
        print("\n\nImport interrupted by user")
        if importer.conn:
            importer.conn.rollback()
    except Exception as e:
        print(f"\nImport failed with error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        importer.close()


if __name__ == '__main__':
    main()
