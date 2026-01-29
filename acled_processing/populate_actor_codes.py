"""
Populate actor_code column in acled_actors table based on ACLED CSV data.

This script:
1. Reads the ACLED CSV file
2. Analyzes actor1/inter1 and actor2/inter2 relationships
3. Determines the most common code for each actor
4. Updates the acled_actors table with the appropriate codes
"""

import pandas as pd
import psycopg2
from psycopg2.extras import execute_batch
from collections import Counter
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'osint_news'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', '')
}

# CSV file path
CSV_PATH = r'd:\JOB\PROJECTS\news_osint\acled_processing\data\ACLED Data_2026-01-25.csv'

def analyze_actor_codes(csv_path):
    """
    Analyze the CSV to determine the most common code for each actor.
    Only processes actor1 (with inter1) and actor2 (with inter2).
    
    Returns:
        dict: {actor_name: most_common_code}
    """
    print("Reading CSV file...")
    df = pd.read_csv(csv_path)
    
    actor_codes = {}
    
    # Process actor1 with inter1
    print("Processing actor1 with inter1 codes...")
    actor1_data = df[['actor1', 'inter1']].dropna()
    for actor_name in actor1_data['actor1'].unique():
        if pd.isna(actor_name) or str(actor_name).strip() == '':
            continue
        
        codes = actor1_data[actor1_data['actor1'] == actor_name]['inter1'].dropna()
        if len(codes) > 0:
            # Get the most common code for this actor
            code_counts = Counter(codes)
            most_common_code = code_counts.most_common(1)[0][0]
            actor_codes[actor_name] = int(most_common_code)
    
    # Process actor2 with inter2
    print("Processing actor2 with inter2 codes...")
    actor2_data = df[['actor2', 'inter2']].dropna()
    for actor_name in actor2_data['actor2'].unique():
        if pd.isna(actor_name) or str(actor_name).strip() == '':
            continue
        
        codes = actor2_data[actor2_data['actor2'] == actor_name]['inter2'].dropna()
        if len(codes) > 0:
            code_counts = Counter(codes)
            most_common_code = code_counts.most_common(1)[0][0]
            
            # If actor already exists from actor1, keep the existing code
            # (actor1 is typically the primary actor)
            if actor_name not in actor_codes:
                actor_codes[actor_name] = int(most_common_code)
    
    print(f"\nTotal unique actors with codes: {len(actor_codes)}")
    
    # Show code distribution
    code_distribution = Counter(actor_codes.values())
    print("\nCode distribution:")
    for code in sorted(code_distribution.keys()):
        print(f"  Code {code}: {code_distribution[code]} actors")
    
    return actor_codes

def update_actor_codes(actor_codes, db_config, dry_run=True):
    """
    Update the acled_actors table with the determined codes.
    
    Args:
        actor_codes: dict of {actor_name: code}
        db_config: database connection configuration
        dry_run: if True, only show what would be updated without making changes
    """
    try:
        print("\nConnecting to database...")
        conn = psycopg2.connect(**db_config)
        cur = conn.cursor()
        
        # Get existing actors from database
        cur.execute("SELECT actor_id, actor_name, actor_code FROM acled_actors")
        db_actors = cur.fetchall()
        
        print(f"Found {len(db_actors)} actors in database")
        
        # Prepare updates
        updates = []
        matched = 0
        not_matched = 0
        already_has_code = 0
        
        for actor_id, actor_name, current_code in db_actors:
            if actor_name in actor_codes:
                matched += 1
                new_code = actor_codes[actor_name]
                
                if current_code is None:
                    updates.append((new_code, actor_id, actor_name))
                else:
                    already_has_code += 1
                    if current_code != new_code:
                        print(f"  Warning: {actor_name} has code {current_code}, CSV suggests {new_code}")
            else:
                not_matched += 1
        
        print(f"\nMatching results:")
        print(f"  Matched: {matched} actors")
        print(f"  Not matched in CSV: {not_matched} actors")
        print(f"  Already have codes: {already_has_code} actors")
        print(f"  Will update: {len(updates)} actors")
        
        if dry_run:
            print("\n=== DRY RUN MODE ===")
            print("No changes will be made to the database.")
            print("\nSample updates (first 20):")
            for code, actor_id, actor_name in updates[:20]:
                print(f"  ID {actor_id}: {actor_name} -> Code {code}")
            
            if len(updates) > 20:
                print(f"  ... and {len(updates) - 20} more")
        else:
            print("\n=== UPDATING DATABASE ===")
            
            if updates:
                # Perform batch update
                update_query = "UPDATE acled_actors SET actor_code = %s WHERE actor_id = %s"
                execute_batch(cur, update_query, [(code, actor_id) for code, actor_id, _ in updates])
                conn.commit()
                print(f"✓ Successfully updated {len(updates)} actors")
            else:
                print("No updates needed")
        
        # Show final statistics
        cur.execute("""
            SELECT 
                ac.code,
                ac.description,
                COUNT(a.actor_id) as actor_count
            FROM acled_actor_codes ac
            LEFT JOIN acled_actors a ON a.actor_code = ac.code
            GROUP BY ac.code, ac.description
            ORDER BY ac.code
        """)
        
        print("\n=== Final Actor Code Distribution ===")
        for code, description, count in cur.fetchall():
            print(f"  Code {code} ({description}): {count} actors")
        
        # Show actors without codes
        cur.execute("SELECT COUNT(*) FROM acled_actors WHERE actor_code IS NULL")
        null_count = cur.fetchone()[0]
        print(f"\nActors without codes: {null_count}")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        raise

def main():
    """Main execution function."""
    print("="*80)
    print("ACLED Actor Code Population Script")
    print("="*80)
    
    # Step 1: Analyze CSV
    actor_codes = analyze_actor_codes(CSV_PATH)
    
    # Save the mapping for reference
    print("\nSaving actor code mapping to file...")
    with open('actor_code_mapping.txt', 'w', encoding='utf-8') as f:
        f.write("Actor Name -> Code\n")
        f.write("="*80 + "\n\n")
        for actor_name in sorted(actor_codes.keys()):
            f.write(f"{actor_name} -> {actor_codes[actor_name]}\n")
    print("✓ Saved to: actor_code_mapping.txt")
    
    # Step 2: Update database (dry run first)
    print("\n" + "="*80)
    print("DRY RUN - Preview of changes")
    print("="*80)
    update_actor_codes(actor_codes, DB_CONFIG, dry_run=True)
    
    # Ask for confirmation
    print("\n" + "="*80)
    response = input("\nDo you want to apply these changes to the database? (yes/no): ").strip().lower()
    
    if response == 'yes':
        print("\n" + "="*80)
        print("APPLYING CHANGES")
        print("="*80)
        update_actor_codes(actor_codes, DB_CONFIG, dry_run=False)
        print("\n✓ All done!")
    else:
        print("\nOperation cancelled. No changes were made to the database.")

if __name__ == "__main__":
    main()
