# ACLED Event Types and Locations - Reference Tables

## Overview

Two new reference tables have been created to store unique combinations of event types and administrative locations from the ACLED dataset. These tables use **ON CONFLICT DO NOTHING** to safely handle duplicate entries during data updates.

---

## 1. Event Types Table

### Table Structure

```sql
CREATE TABLE IF NOT EXISTS acled_event_types (
    event_type_id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    sub_event_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_type, sub_event_type)
);
```

### Statistics

- **Total unique combinations**: 25
- **Main event types**: 6
  - Battles
  - Explosions/Remote violence
  - Protests
  - Riots
  - Strategic developments
  - Violence against civilians

### Event Type Breakdown

| Event Type | Sub-Event Types | Count |
|------------|----------------|-------|
| **Battles** | Armed clash, Government regains territory, Non-state actor overtakes territory | 3 |
| **Explosions/Remote violence** | Air/drone strike, Chemical weapon, Grenade, Remote explosive/landmine/IED, Shelling/artillery/missile attack, Suicide bomb | 6 |
| **Protests** | Excessive force against protesters, Peaceful protest, Protest with intervention | 3 |
| **Riots** | Mob violence, Violent demonstration | 2 |
| **Strategic developments** | Agreement, Arrests, Change to group/activity, Disrupted weapons use, Headquarters or base established, Looting/property destruction, Non-violent transfer of territory, Other | 8 |
| **Violence against civilians** | Abduction/forced disappearance, Attack, Sexual violence | 3 |

### Usage Example

```sql
-- Get all events with their type descriptions
SELECT 
    e.event_date,
    et.event_type,
    et.sub_event_type,
    e.admin1,
    e.fatalities
FROM acled_events e
LEFT JOIN acled_event_types et 
    ON e.event_type = et.event_type 
    AND (e.sub_event_type = et.sub_event_type OR (e.sub_event_type IS NULL AND et.sub_event_type IS NULL))
ORDER BY e.event_date DESC;
```

---

## 2. Locations Table

### Table Structure

```sql
CREATE TABLE IF NOT EXISTS acled_locations (
    location_id SERIAL PRIMARY KEY,
    admin1 VARCHAR(100),  -- State/Region
    admin2 VARCHAR(100),  -- District
    admin3 VARCHAR(100),  -- Township
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(admin1, admin2, admin3)
);
```

### Statistics

- **Total unique combinations**: 330
- **States/Regions (admin1)**: 15
- **Districts (admin2)**: ~74
- **Townships (admin3)**: ~330

### Geographic Coverage

| State/Region | Districts | Townships (approx) |
|--------------|-----------|-------------------|
| **Ayeyarwady** | 6 | 26 |
| **Bago-East** | 2 | 14 |
| **Bago-West** | 2 | 13 |
| **Chin** | 4 | 9 |
| **Kachin** | 4 | 18 |
| **Kayah** | 2 | 7 |
| **Kayin** | 4 | 7 |
| **Magway** | 5 | 25 |
| **Mandalay** | 7 | 29 |
| **Mon** | 2 | 10 |
| **Nay Pyi Taw** | 3 | 9 |
| **Rakhine** | 5 | 17 |
| **Sagaing** | 11 | 44 |
| **Shan-East** | 3 | 10 |
| **Shan-North** | 9 | 28 |
| **Shan-South** | 6 | 25 |
| **Tanintharyi** | 3 | 10 |
| **Yangon** | 5 | 45 |

### Usage Examples

```sql
-- Get all events in a specific state
SELECT 
    e.event_date,
    l.admin1,
    l.admin2,
    l.admin3,
    e.event_type,
    e.fatalities
FROM acled_events e
LEFT JOIN acled_locations l 
    ON e.admin1 = l.admin1 
    AND (e.admin2 = l.admin2 OR (e.admin2 IS NULL AND l.admin2 IS NULL))
    AND (e.admin3 = l.admin3 OR (e.admin3 IS NULL AND l.admin3 IS NULL))
WHERE l.admin1 = 'Sagaing'
ORDER BY e.event_date DESC;

-- Count events by district
SELECT 
    l.admin1,
    l.admin2,
    COUNT(e.event_id) as event_count,
    SUM(e.fatalities) as total_fatalities
FROM acled_locations l
LEFT JOIN acled_events e 
    ON e.admin1 = l.admin1 
    AND (e.admin2 = l.admin2 OR (e.admin2 IS NULL AND l.admin2 IS NULL))
    AND (e.admin3 = l.admin3 OR (e.admin3 IS NULL AND l.admin3 IS NULL))
GROUP BY l.admin1, l.admin2
ORDER BY event_count DESC;

-- Get all townships in a district
SELECT 
    admin1,
    admin2,
    admin3
FROM acled_locations
WHERE admin1 = 'Mandalay' AND admin2 = 'Mandalay'
ORDER BY admin3;
```

---

## Files Created

1. **`sql/create_acled_event_types.sql`** - Standalone SQL file to create event types table
2. **`sql/create_acled_locations.sql`** - Standalone SQL file to create locations table
3. **`extract_event_types_locations.py`** - Python script to extract data from CSV and generate SQL files
4. **`EVENT_TYPES_LOCATIONS_REFERENCE.md`** - This documentation file

---

## Update Workflow

When new ACLED data is received:

1. **Run the extraction script**:
   ```bash
   python extract_event_types_locations.py
   ```

2. **Execute the generated SQL files**:
   ```bash
   psql -U your_user -d your_database -f sql/create_acled_event_types.sql
   psql -U your_user -d your_database -f sql/create_acled_locations.sql
   ```

3. The `ON CONFLICT DO NOTHING` clause ensures:
   - Existing records are preserved
   - Only new combinations are inserted
   - No errors occur from duplicate entries

---

## Integration with Main Schema

These reference tables can be optionally joined with the main `acled_events` table for:

- **Data validation**: Ensure event types and locations match known values
- **Dropdown lists**: Populate UI filters with valid options
- **Analytics**: Group and aggregate data by standardized categories
- **Reporting**: Generate summaries by region or event type

### Complete Event Query Example

```sql
SELECT 
    e.event_date,
    et.event_type,
    et.sub_event_type,
    l.admin1 as state,
    l.admin2 as district,
    l.admin3 as township,
    i.title as interaction_type,
    e.fatalities,
    e.notes
FROM acled_events e
LEFT JOIN acled_event_types et 
    ON e.event_type = et.event_type 
    AND (e.sub_event_type = et.sub_event_type OR (e.sub_event_type IS NULL AND et.sub_event_type IS NULL))
LEFT JOIN acled_locations l 
    ON e.admin1 = l.admin1 
    AND (e.admin2 = l.admin2 OR (e.admin2 IS NULL AND l.admin2 IS NULL))
    AND (e.admin3 = l.admin3 OR (e.admin3 IS NULL AND l.admin3 IS NULL))
LEFT JOIN acled_interactions i 
    ON e.interaction_code::INTEGER = i.code
WHERE e.event_date >= '2024-01-01'
ORDER BY e.event_date DESC
LIMIT 100;
```

---

## Notes

- **NULL handling**: Some locations may have NULL values for admin2 or admin3 (e.g., events at state level only)
- **Unique constraint**: The combination of (admin1, admin2, admin3) must be unique
- **Indexes**: Created on all admin columns for faster lookups
- **Case sensitivity**: Location names are case-sensitive
- **Updates**: Re-running the SQL files is safe and will only add new entries

---

## Data Quality

### Event Types
- All 25 combinations are valid ACLED event classifications
- No NULL values in event_type column
- Some sub_event_types may be NULL

### Locations
- Covers all 15 states/regions of Myanmar
- 330 unique location combinations
- Includes special administrative zones (Naga, Kokang, Pa Laung, Pa-O, Danu)
- Some entries have NULL admin3 (township) for district or state-level events
