"""
Extract unique event types and locations from ACLED CSV data.
Creates SQL files for acled_event_types and acled_locations tables.
"""

import pandas as pd
import os

# CSV file path
CSV_PATH = r'd:\JOB\PROJECTS\news_osint\acled_processing\data\ACLED Data_2026-01-25.csv'

def extract_event_types(csv_path):
    """Extract unique (event_type, sub_event_type) combinations."""
    print("Reading CSV file...")
    df = pd.read_csv(csv_path)
    
    print("Extracting unique event types...")
    # Get unique combinations, dropping rows where both are NaN
    event_types = df[['event_type', 'sub_event_type']].dropna(how='all').drop_duplicates()
    
    # Sort by event_type, then sub_event_type
    event_types = event_types.sort_values(['event_type', 'sub_event_type'])
    
    print(f"\nFound {len(event_types)} unique event type combinations:")
    print(event_types.to_string(index=False))
    
    return event_types

def extract_locations(csv_path):
    """Extract unique (admin1, admin2, admin3) combinations."""
    print("\n" + "="*80)
    print("Extracting unique locations...")
    df = pd.read_csv(csv_path)
    
    # Get unique combinations, dropping rows where all are NaN
    locations = df[['admin1', 'admin2', 'admin3']].dropna(how='all').drop_duplicates()
    
    # Sort by admin1, admin2, admin3
    locations = locations.sort_values(['admin1', 'admin2', 'admin3'])
    
    print(f"\nFound {len(locations)} unique location combinations:")
    print(f"\nSample locations (first 20):")
    print(locations.head(20).to_string(index=False))
    
    return locations

def generate_event_types_sql(event_types):
    """Generate SQL file for acled_event_types table."""
    sql_lines = []
    
    sql_lines.append("-- ============================================================================")
    sql_lines.append("-- ACLED EVENT TYPES TABLE")
    sql_lines.append("-- ============================================================================")
    sql_lines.append("-- This table stores unique combinations of event_type and sub_event_type")
    sql_lines.append("-- from ACLED data for reference and mapping purposes.")
    sql_lines.append("")
    sql_lines.append("CREATE TABLE IF NOT EXISTS acled_event_types (")
    sql_lines.append("    event_type_id SERIAL PRIMARY KEY,")
    sql_lines.append("    event_type VARCHAR(100) NOT NULL,")
    sql_lines.append("    sub_event_type VARCHAR(100),")
    sql_lines.append("    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,")
    sql_lines.append("    UNIQUE(event_type, sub_event_type)")
    sql_lines.append(");")
    sql_lines.append("")
    sql_lines.append("COMMENT ON TABLE acled_event_types IS 'Reference table for ACLED event type combinations';")
    sql_lines.append("COMMENT ON COLUMN acled_event_types.event_type IS 'Main event type category';")
    sql_lines.append("COMMENT ON COLUMN acled_event_types.sub_event_type IS 'Specific sub-category of the event';")
    sql_lines.append("")
    sql_lines.append("-- Insert unique event type combinations")
    sql_lines.append("-- Using ON CONFLICT DO NOTHING to skip duplicates on updates")
    
    for _, row in event_types.iterrows():
        event_type = row['event_type']
        sub_event_type = row['sub_event_type']
        
        # Handle NULL values
        if pd.isna(event_type):
            event_type_sql = "NULL"
        else:
            # Escape single quotes
            event_type_sql = f"'{event_type.replace(chr(39), chr(39)+chr(39))}'"
        
        if pd.isna(sub_event_type):
            sub_event_type_sql = "NULL"
        else:
            # Escape single quotes
            sub_event_type_sql = f"'{sub_event_type.replace(chr(39), chr(39)+chr(39))}'"
        
        sql_lines.append(f"INSERT INTO acled_event_types (event_type, sub_event_type) VALUES ({event_type_sql}, {sub_event_type_sql}) ON CONFLICT (event_type, sub_event_type) DO NOTHING;")
    
    sql_lines.append("")
    sql_lines.append("-- Create index for faster lookups")
    sql_lines.append("CREATE INDEX IF NOT EXISTS idx_acled_event_types_event_type ON acled_event_types(event_type);")
    sql_lines.append("CREATE INDEX IF NOT EXISTS idx_acled_event_types_sub_event_type ON acled_event_types(sub_event_type);")
    
    return "\n".join(sql_lines)

def generate_locations_sql(locations):
    """Generate SQL file for acled_locations table."""
    sql_lines = []
    
    sql_lines.append("-- ============================================================================")
    sql_lines.append("-- ACLED LOCATIONS TABLE")
    sql_lines.append("-- ============================================================================")
    sql_lines.append("-- This table stores unique combinations of admin1, admin2, admin3")
    sql_lines.append("-- (State/Region, District, Township) from ACLED data for reference and mapping.")
    sql_lines.append("")
    sql_lines.append("CREATE TABLE IF NOT EXISTS acled_locations (")
    sql_lines.append("    location_id SERIAL PRIMARY KEY,")
    sql_lines.append("    admin1 VARCHAR(100),  -- State/Region")
    sql_lines.append("    admin2 VARCHAR(100),  -- District")
    sql_lines.append("    admin3 VARCHAR(100),  -- Township")
    sql_lines.append("    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,")
    sql_lines.append("    UNIQUE(admin1, admin2, admin3)")
    sql_lines.append(");")
    sql_lines.append("")
    sql_lines.append("COMMENT ON TABLE acled_locations IS 'Reference table for ACLED administrative location combinations';")
    sql_lines.append("COMMENT ON COLUMN acled_locations.admin1 IS 'State or Region (admin level 1)';")
    sql_lines.append("COMMENT ON COLUMN acled_locations.admin2 IS 'District (admin level 2)';")
    sql_lines.append("COMMENT ON COLUMN acled_locations.admin3 IS 'Township (admin level 3)';")
    sql_lines.append("")
    sql_lines.append("-- Insert unique location combinations")
    sql_lines.append("-- Using ON CONFLICT DO NOTHING to skip duplicates on updates")
    
    for _, row in locations.iterrows():
        admin1 = row['admin1']
        admin2 = row['admin2']
        admin3 = row['admin3']
        
        # Handle NULL values
        if pd.isna(admin1):
            admin1_sql = "NULL"
        else:
            admin1_sql = f"'{admin1.replace(chr(39), chr(39)+chr(39))}'"
        
        if pd.isna(admin2):
            admin2_sql = "NULL"
        else:
            admin2_sql = f"'{admin2.replace(chr(39), chr(39)+chr(39))}'"
        
        if pd.isna(admin3):
            admin3_sql = "NULL"
        else:
            admin3_sql = f"'{admin3.replace(chr(39), chr(39)+chr(39))}'"
        
        sql_lines.append(f"INSERT INTO acled_locations (admin1, admin2, admin3) VALUES ({admin1_sql}, {admin2_sql}, {admin3_sql}) ON CONFLICT (admin1, admin2, admin3) DO NOTHING;")
    
    sql_lines.append("")
    sql_lines.append("-- Create indexes for faster lookups")
    sql_lines.append("CREATE INDEX IF NOT EXISTS idx_acled_locations_admin1 ON acled_locations(admin1);")
    sql_lines.append("CREATE INDEX IF NOT EXISTS idx_acled_locations_admin2 ON acled_locations(admin2);")
    sql_lines.append("CREATE INDEX IF NOT EXISTS idx_acled_locations_admin3 ON acled_locations(admin3);")
    
    return "\n".join(sql_lines)

def main():
    """Main execution function."""
    print("="*80)
    print("ACLED Event Types and Locations Extraction")
    print("="*80)
    
    # Extract event types
    event_types = extract_event_types(CSV_PATH)
    
    # Extract locations
    locations = extract_locations(CSV_PATH)
    
    # Generate SQL files
    print("\n" + "="*80)
    print("Generating SQL files...")
    
    # Event types SQL
    event_types_sql = generate_event_types_sql(event_types)
    output_file = 'sql/create_acled_event_types.sql'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(event_types_sql)
    print(f"✓ Created: {output_file}")
    
    # Locations SQL
    locations_sql = generate_locations_sql(locations)
    output_file = 'sql/create_acled_locations.sql'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(locations_sql)
    print(f"✓ Created: {output_file}")
    
    # Summary
    print("\n" + "="*80)
    print("SUMMARY")
    print("="*80)
    print(f"Event type combinations: {len(event_types)}")
    print(f"Location combinations: {len(locations)}")
    print("\nSQL files created:")
    print("  - sql/create_acled_event_types.sql")
    print("  - sql/create_acled_locations.sql")
    print("\nBoth files use 'ON CONFLICT DO NOTHING' to skip duplicates on updates.")
    print("="*80)

if __name__ == "__main__":
    main()
