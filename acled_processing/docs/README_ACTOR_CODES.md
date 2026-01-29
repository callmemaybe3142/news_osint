# ACLED Actor Code Implementation - Complete Package

## 📋 Summary

This package provides everything you need to add and populate the `actor_code` column in your `acled_actors` table.

### ✅ What's Included

1. **SQL Migration Script** - Add the column to existing database
2. **Python Population Script** - Automatically populate codes from CSV data
3. **Reference Queries** - Common SQL queries for analysis
4. **Documentation** - Complete guides and references

---

## 🚀 Quick Start

### Option 1: New Database (Schema Not Yet Created)

Use the updated `schema_acled.sql` which already includes the `actor_code` column:

```bash
psql -h localhost -U postgres -d osint_news -f sql/schema_acled.sql
```

### Option 2: Existing Database (Add Column to Existing Table)

**Step 1:** Add the column
```bash
psql -h localhost -U postgres -d osint_news -f sql/add_actor_code_column.sql
```

**Step 2:** Populate the codes
```bash
cd d:\JOB\PROJECTS\news_osint\acled_processing
python populate_actor_codes.py
```

---

## 📁 Files Created

### SQL Files
| File | Purpose |
|------|---------|
| `sql/schema_acled.sql` | Updated schema with actor_code column |
| `sql/add_actor_code_column.sql` | Migration script to add column to existing table |
| `sql/actor_code_queries.sql` | Reference queries for analysis |

### Python Scripts
| File | Purpose |
|------|---------|
| `populate_actor_codes.py` | Main script to populate actor codes |
| `extract_actor_codes.py` | Utility to analyze CSV and extract codes |

### Documentation
| File | Purpose |
|------|---------|
| `POPULATE_ACTOR_CODES_GUIDE.md` | Step-by-step implementation guide |
| `ACTOR_CODE_SUMMARY.md` | Overview and code descriptions |
| `actor_codes_summary.txt` | Detailed code analysis from CSV |
| `README_ACTOR_CODES.md` | This file |

---

## 🔢 Actor Code Reference

| Code | Description | Examples |
|------|-------------|----------|
| **0** | No Actor 2 / No Interaction | (No second actor) |
| **1** | State Forces | Military, Police, Security Forces |
| **2** | Rebel Groups | KNU/KNLA, UWSP/UWSA, KIA |
| **3** | Political Militias | DKBA, Armed Political Groups |
| **4** | Identity Militias | Ethnic/Religious Militias |
| **5** | Rioters | Violent Mobs |
| **6** | Protesters | Demonstrators |
| **7** | Civilians | Civilian Population |
| **8** | External/Other Forces | Foreign Military, Private Security |

---

## 🔧 Database Schema

### Updated acled_actors Table

```sql
CREATE TABLE acled_actors (
    actor_id SERIAL PRIMARY KEY,
    actor_name VARCHAR(255) UNIQUE NOT NULL,
    actor_code SMALLINT CHECK (actor_code >= 0 AND actor_code <= 8),  -- NEW!
    actor_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### New acled_actor_codes Reference Table

```sql
CREATE TABLE acled_actor_codes (
    code SMALLINT PRIMARY KEY CHECK (code >= 0 AND code <= 8),
    description VARCHAR(100) NOT NULL,
    notes TEXT
);
```

---

## 📊 Usage Examples

### Find all State Forces actors
```sql
SELECT actor_name
FROM acled_actors
WHERE actor_code = 1;
```

### Events between State Forces and Rebel Groups
```sql
SELECT 
    e.event_date,
    e.event_type,
    a1.actor_name as state_actor,
    a2.actor_name as rebel_actor
FROM acled_events e
JOIN acled_event_actors ea1 ON e.event_id = ea1.event_id AND ea1.actor_role = 1
JOIN acled_actors a1 ON ea1.actor_id = a1.actor_id
JOIN acled_event_actors ea2 ON e.event_id = ea2.event_id AND ea2.actor_role = 2
JOIN acled_actors a2 ON ea2.actor_id = a2.actor_id
WHERE a1.actor_code = 1 AND a2.actor_code = 2
ORDER BY e.event_date DESC;
```

### Actor code distribution
```sql
SELECT 
    ac.description,
    COUNT(a.actor_id) as actor_count
FROM acled_actor_codes ac
LEFT JOIN acled_actors a ON a.actor_code = ac.code
GROUP BY ac.code, ac.description
ORDER BY ac.code;
```

---

## 🛠️ How populate_actor_codes.py Works

### Algorithm

1. **Read CSV** - Loads the ACLED data file
2. **Analyze Relationships**:
   - Maps `actor1` → `inter1` codes
   - Maps `actor2` → `inter2` codes
3. **Determine Most Common Code** - For each actor, finds the most frequently occurring code
4. **Preview Changes** - Shows dry run of what will be updated
5. **Confirm & Update** - Asks for confirmation before making changes
6. **Report Results** - Shows statistics and final distribution

### Safety Features

- ✅ **Dry Run Mode** - Preview changes before applying
- ✅ **Confirmation Prompt** - Explicit user confirmation required
- ✅ **Preserves Existing Codes** - Won't overwrite if actor already has a code
- ✅ **Detailed Logging** - Shows what's happening at each step
- ✅ **Error Handling** - Graceful handling of database errors

---

## 📈 Expected Results

After running the population script, you should see:

```
Total unique actors with codes: ~1,200-1,500
Code distribution:
  Code 1 (State Forces): ~400-500 actors
  Code 2 (Rebel Groups): ~200-300 actors
  Code 3 (Political Militias): ~100-150 actors
  Code 4 (Identity Militias): ~50-100 actors
  Code 5 (Rioters): ~30-50 actors
  Code 6 (Protesters): ~50-80 actors
  Code 7 (Civilians): ~100-200 actors
  Code 8 (External/Other Forces): ~50-100 actors
```

---

## 🔍 Verification

After implementation, verify with these queries:

```sql
-- Check column exists
SELECT column_name FROM information_schema.columns
WHERE table_name = 'acled_actors' AND column_name = 'actor_code';

-- Count actors with codes
SELECT COUNT(*) FROM acled_actors WHERE actor_code IS NOT NULL;

-- Show distribution
SELECT actor_code, COUNT(*) 
FROM acled_actors 
GROUP BY actor_code 
ORDER BY actor_code;
```

---

## 🐛 Troubleshooting

### "Column already exists"
- Skip the migration step, go directly to population

### "Cannot connect to database"
- Check `.env` file or `DB_CONFIG` in script
- Verify PostgreSQL is running
- Check database credentials

### "Actors not matched in CSV"
- Normal if database has actors not in CSV
- These will remain with `NULL` actor_code
- Can be manually updated later

### "Code mismatch warning"
- Actor has different code than CSV suggests
- Script won't overwrite existing codes
- Review manually if needed

---

## 📝 Next Steps

After implementation:

1. ✅ Verify all actors have codes (or document which don't)
2. ✅ Run analysis queries to understand actor patterns
3. ✅ Update your data import scripts to include actor codes
4. ✅ Consider adding actor_code to your dashboards/reports

---

## 💡 Tips

- **Use the reference table** - Join with `acled_actor_codes` for readable descriptions
- **Index the column** - Consider adding an index if you filter by actor_code frequently:
  ```sql
  CREATE INDEX idx_acled_actors_code ON acled_actors(actor_code);
  ```
- **Document exceptions** - Keep track of actors that don't fit standard codes
- **Regular updates** - Re-run population script when adding new actors

---

## 📞 Support

For questions or issues:
1. Check `POPULATE_ACTOR_CODES_GUIDE.md` for detailed steps
2. Review `actor_code_queries.sql` for query examples
3. Check `actor_codes_summary.txt` for code analysis

---

## ✨ Summary

You now have:
- ✅ `actor_code` column added to schema
- ✅ Reference table with code descriptions
- ✅ Automated population script
- ✅ Comprehensive documentation
- ✅ Query examples and templates

**Ready to implement!** Start with the Quick Start section above.
