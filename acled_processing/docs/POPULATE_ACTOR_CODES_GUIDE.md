# How to Add and Populate actor_code Column

## Step-by-Step Guide

### Step 1: Add the Column to Existing Database

If you already have the `acled_actors` table in your database, run this SQL script to add the `actor_code` column:

```bash
psql -h localhost -U postgres -d osint_news -f sql/add_actor_code_column.sql
```

Or manually in your PostgreSQL client:

```sql
-- Add the column
ALTER TABLE acled_actors 
ADD COLUMN actor_code SMALLINT CHECK (actor_code >= 0 AND actor_code <= 8);

-- Add comment
COMMENT ON COLUMN acled_actors.actor_code IS 
    'ACLED interaction code: 0=No interaction, 1=State Forces, 2=Rebel Groups, 3=Political Militias, 4=Identity Militias, 5=Rioters, 6=Protesters, 7=Civilians, 8=External/Other Forces';
```

### Step 2: Create the Reference Table

```sql
CREATE TABLE acled_actor_codes (
    code SMALLINT PRIMARY KEY CHECK (code >= 0 AND code <= 8),
    description VARCHAR(100) NOT NULL,
    notes TEXT
);

INSERT INTO acled_actor_codes (code, description, notes) VALUES
    (0, 'No Actor 2 / No Interaction', 'Used when there is no second actor or no interaction'),
    (1, 'State Forces', 'Government military, police, and security forces'),
    (2, 'Rebel Groups', 'Armed opposition groups and insurgents'),
    (3, 'Political Militias', 'Armed groups affiliated with political parties'),
    (4, 'Identity Militias', 'Ethnic, religious, or communal militias'),
    (5, 'Rioters', 'Violent mob or crowd actions'),
    (6, 'Protesters', 'Non-violent demonstrators and protesters'),
    (7, 'Civilians', 'Unarmed civilian population'),
    (8, 'External/Other Forces', 'Foreign military, private security, international organizations');
```

### Step 3: Configure Database Connection

Create a `.env` file in the `acled_processing` directory:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=osint_news
DB_USER=postgres
DB_PASSWORD=your_password_here
```

Or edit the `DB_CONFIG` dictionary in `populate_actor_codes.py` directly.

### Step 4: Run the Population Script

```bash
cd d:\JOB\PROJECTS\news_osint\acled_processing
python populate_actor_codes.py
```

The script will:
1. ✅ Read the ACLED CSV file
2. ✅ Analyze actor1/inter1 and actor2/inter2 relationships
3. ✅ Determine the most common code for each actor
4. ✅ Show a DRY RUN preview of changes
5. ✅ Ask for confirmation before updating
6. ✅ Update the database with the codes

### Step 5: Verify the Results

After running the script, verify the updates:

```sql
-- Check code distribution
SELECT 
    ac.code,
    ac.description,
    COUNT(a.actor_id) as actor_count
FROM acled_actor_codes ac
LEFT JOIN acled_actors a ON a.actor_code = ac.code
GROUP BY ac.code, ac.description
ORDER BY ac.code;

-- Check actors without codes
SELECT actor_name 
FROM acled_actors 
WHERE actor_code IS NULL
LIMIT 20;

-- Sample actors with codes
SELECT 
    a.actor_name,
    a.actor_code,
    ac.description
FROM acled_actors a
JOIN acled_actor_codes ac ON a.actor_code = ac.code
ORDER BY a.actor_code, a.actor_name
LIMIT 50;
```

---

## Files Created

1. **`sql/add_actor_code_column.sql`** - SQL migration script to add the column
2. **`populate_actor_codes.py`** - Python script to populate the codes
3. **`POPULATE_ACTOR_CODES_GUIDE.md`** - This guide

---

## How the Script Works

### Logic for Determining Actor Codes

1. **Priority Order:**
   - First checks `actor1` with `inter1` code
   - Then checks `actor2` with `inter2` code (if not found in actor1)

2. **Most Common Code:**
   - For each actor, the script counts how many times each code appears
   - Assigns the most frequently occurring code to that actor
   - Example: If "Military Forces of Myanmar" appears 1000 times with code 1 and 5 times with code 2, it gets code 1

3. **Safety Features:**
   - **Dry run mode** - Shows what will change before making changes
   - **Confirmation prompt** - Asks for explicit confirmation
   - **Preserves existing codes** - Won't overwrite if actor already has a code
   - **Detailed reporting** - Shows statistics and warnings

### Example Output

```
================================================================================
ACLED Actor Code Population Script
================================================================================
Reading CSV file...
Processing actor1 with inter1 codes...
Processing actor2 with inter2 codes...
Processing associated actors...

Total unique actors with codes: 1,234

Code distribution:
  Code 1: 456 actors
  Code 2: 234 actors
  Code 3: 123 actors
  Code 4: 89 actors
  Code 5: 45 actors
  Code 6: 67 actors
  Code 7: 156 actors
  Code 8: 64 actors

Connecting to database...
Found 1,234 actors in database

Matching results:
  Matched: 1,234 actors
  Not matched in CSV: 0 actors
  Already have codes: 0 actors
  Will update: 1,234 actors

=== DRY RUN MODE ===
Sample updates (first 20):
  ID 1: Military Forces of Myanmar (1988-2011) -> Code 1
  ID 2: KNU/KNLA: Karen National Union/Karen National Liberation Army -> Code 2
  ...

Do you want to apply these changes to the database? (yes/no): yes

=== UPDATING DATABASE ===
✓ Successfully updated 1,234 actors

=== Final Actor Code Distribution ===
  Code 0 (No Actor 2 / No Interaction): 0 actors
  Code 1 (State Forces): 456 actors
  Code 2 (Rebel Groups): 234 actors
  Code 3 (Political Militias): 123 actors
  Code 4 (Identity Militias): 89 actors
  Code 5 (Rioters): 45 actors
  Code 6 (Protesters): 67 actors
  Code 7 (Civilians): 156 actors
  Code 8 (External/Other Forces): 64 actors

Actors without codes: 0

✓ All done!
```

---

## Troubleshooting

### Issue: "Column already exists"
- The column was already added. Skip Step 1 and go directly to Step 4.

### Issue: "Cannot connect to database"
- Check your `.env` file or `DB_CONFIG` settings
- Ensure PostgreSQL is running
- Verify database name and credentials

### Issue: "Actors not matched in CSV"
- Some actors in your database may not be in the CSV file
- These will remain with `NULL` actor_code
- You can manually assign codes later if needed

### Issue: "Code mismatch warning"
- The script found an actor already has a code different from what the CSV suggests
- The script will NOT overwrite existing codes
- Review these manually if needed

---

## Manual Updates

If you need to manually update specific actors:

```sql
-- Update a single actor
UPDATE acled_actors 
SET actor_code = 1 
WHERE actor_name = 'Military Forces of Myanmar (1988-2011)';

-- Update multiple actors by pattern
UPDATE acled_actors 
SET actor_code = 7 
WHERE actor_name LIKE '%Civilians%' AND actor_code IS NULL;

-- Update based on actor_type
UPDATE acled_actors 
SET actor_code = 2 
WHERE actor_type = 'Rebel Group' AND actor_code IS NULL;
```
