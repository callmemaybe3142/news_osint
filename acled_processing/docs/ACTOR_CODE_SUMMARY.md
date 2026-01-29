# ACLED Actor Code Extraction - Summary

## Task Completed ✓

I have successfully:

1. **Extracted unique actor codes** from the ACLED CSV file
2. **Added the `actor_code` column** to the `acled_actors` table in the schema
3. **Created a reference table** (`acled_actor_codes`) with descriptions

---

## Unique Actor Codes Found

From analyzing the CSV file (`ACLED Data_2026-01-25.csv`), I found **9 unique codes**:

```
[0, 1, 2, 3, 4, 5, 6, 7, 8]
```

These codes come from the `inter1` and `inter2` columns in the CSV, which represent the interaction/actor type codes.

---

## Schema Changes Made

### 1. Updated `acled_actors` Table

**Location:** `schema_acled.sql` lines 61-67

Added the `actor_code` column:

```sql
CREATE TABLE acled_actors (
    actor_id SERIAL PRIMARY KEY,
    actor_name VARCHAR(255) UNIQUE NOT NULL,
    actor_code SMALLINT CHECK (actor_code >= 0 AND actor_code <= 8),  -- ACLED inter1/inter2 codes
    actor_type VARCHAR(100),  -- Can be categorized later
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Features:**
- `SMALLINT` data type (efficient storage)
- `CHECK` constraint to ensure values are between 0-8
- Allows NULL (some actors may not have a code initially)

### 2. Added Reference Table `acled_actor_codes`

**Location:** `schema_acled.sql` lines 91-109

Created a lookup table with code descriptions:

```sql
CREATE TABLE acled_actor_codes (
    code SMALLINT PRIMARY KEY CHECK (code >= 0 AND code <= 8),
    description VARCHAR(100) NOT NULL,
    notes TEXT
);
```

**Data inserted:**
- Code 0: No Actor 2 / No Interaction
- Code 1: State Forces
- Code 2: Rebel Groups
- Code 3: Political Militias
- Code 4: Identity Militias
- Code 5: Rioters
- Code 6: Protesters
- Code 7: Civilians
- Code 8: External/Other Forces

---

## Code Meanings (Based on ACLED Documentation)

| Code | Description | Examples from Data |
|------|-------------|-------------------|
| **0** | No Actor 2 / No Interaction | Used when there's no second actor |
| **1** | State Forces | Military Forces of Myanmar, Police Forces |
| **2** | Rebel Groups | KNU/KNLA, UWSP/UWSA, RCSS/SSA-S |
| **3** | Political Militias | DKBA, KPC, Unidentified Armed Groups |
| **4** | Identity Militias | Rohingya Muslim Militia, Rakhine Ethnic Militia |
| **5** | Rioters | Rioters (Myanmar), Rioters (India) |
| **6** | Protesters | Protesters (Myanmar), Protesters (International) |
| **7** | Civilians | Civilians (Myanmar), Civilians (International) |
| **8** | External/Other Forces | Private Security, Foreign Military Forces |

---

## Usage Examples

### Query actors with their code descriptions:

```sql
SELECT 
    a.actor_name,
    a.actor_code,
    ac.description as code_description
FROM acled_actors a
LEFT JOIN acled_actor_codes ac ON a.actor_code = ac.code
ORDER BY a.actor_code, a.actor_name;
```

### Find all State Forces actors:

```sql
SELECT actor_name
FROM acled_actors
WHERE actor_code = 1;
```

### Get events by actor type:

```sql
SELECT 
    e.event_date,
    e.event_type,
    a.actor_name,
    ac.description as actor_type
FROM acled_events e
JOIN acled_event_actors ea ON e.event_id = ea.event_id
JOIN acled_actors a ON ea.actor_id = a.actor_id
JOIN acled_actor_codes ac ON a.actor_code = ac.code
WHERE ac.code = 2  -- Rebel Groups
ORDER BY e.event_date DESC;
```

---

## Files Created/Modified

1. **Modified:** `schema_acled.sql`
   - Added `actor_code` column to `acled_actors` table
   - Added `acled_actor_codes` reference table
   - Added helpful comments

2. **Created:** `extract_actor_codes.py`
   - Python script to extract unique codes from CSV
   - Analyzes inter1 and inter2 columns

3. **Created:** `actor_codes_summary.txt`
   - Detailed summary of all codes found
   - Sample actors for each code
   - Reference documentation

---

## Next Steps (Optional)

If you want to populate the `actor_code` column for existing actors, you can:

1. Create a mapping script that reads the CSV
2. For each unique actor name, determine their most common inter1/inter2 code
3. Update the `acled_actors` table with the appropriate code

Would you like me to create this population script?
