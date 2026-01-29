# ACLED Import Quick Reference

## Scripts Overview

### 1. `import_acled_data.py` - Initial Bulk Import
**Use for:** First-time import or complete database reload

```bash
python import_acled_data.py "ACLED Data_2026-01-25.csv"
```

**What it does:**
- Loads entire CSV file
- Bulk inserts ALL actors, sources, and events
- Very fast (2-5 minutes for 85k events)
- Assumes data is clean (no duplicate checking)

**When to use:**
- ✅ First time setting up the database
- ✅ Complete database reload
- ✅ You've cleaned the database with cleanup script

---

### 2. `update_acled_data.py` - Incremental Updates
**Use for:** Weekly/regular updates with new data

```bash
python update_acled_data.py "ACLED Data_Weekly_2026-02-01.csv"
```

**What it does:**
- Checks for existing events (by `event_id_cnty`)
- Skips duplicate events automatically
- Reuses existing actors and sources
- Only inserts NEW data
- Shows statistics on duplicates vs new data

**When to use:**
- ✅ Weekly data updates from ACLED
- ✅ Adding new events to existing database
- ✅ You're not sure if data contains duplicates

**Output example:**
```
Total rows in CSV:     1,234
Duplicate events:      856 (skipped)
New events inserted:   378
New actors created:    12
New sources created:   3
```

---

### 3. `cleanup_acled_data.py` - Delete All Data
**Use for:** Clearing database before fresh import

```bash
python cleanup_acled_data.py
```

**What it does:**
- Asks for confirmation (type "yes")
- Deletes ALL ACLED data
- Resets ID sequences
- Shows before/after counts

**When to use:**
- ✅ Before doing a fresh bulk import
- ✅ Testing/development
- ⚠️ **NEVER** use in production without backup!

---

## Typical Workflow

### Initial Setup (First Time)
```bash
# 1. Create database schema
psql -h localhost -U postgres -d osint_news -f schema_acled.sql

# 2. Import initial data
python import_acled_data.py "ACLED_Myanmar_2010-2026.csv"
```

### Weekly Updates
```bash
# Download new weekly data from ACLED
# Then run incremental update
python update_acled_data.py "ACLED_Myanmar_Weekly_2026-02-01.csv"
```

### Full Reload (if needed)
```bash
# 1. Clean existing data
python cleanup_acled_data.py

# 2. Import fresh data
python import_acled_data.py "ACLED_Myanmar_Full_2026-02-01.csv"
```

---

## Performance Comparison

| Scenario | Script | Time (85k events) |
|----------|--------|-------------------|
| Initial import | `import_acled_data.py` | ~2-5 minutes |
| Update (100% new) | `update_acled_data.py` | ~3-6 minutes |
| Update (50% duplicates) | `update_acled_data.py` | ~2-3 minutes |
| Update (90% duplicates) | `update_acled_data.py` | ~1-2 minutes |

---

## Troubleshooting

### "Duplicate key violation" error
**Solution:** Use `update_acled_data.py` instead of `import_acled_data.py`

### Import is slow
**Check:**
- Database indexes are created (run schema_acled.sql)
- Using bulk import script (not old version)
- Network latency to database

### "No new events to import"
**This is normal!** It means all events in the CSV already exist in the database.

### Materialized view refresh error
**Solution:** Run these SQL commands:
```sql
CREATE UNIQUE INDEX IF NOT EXISTS idx_acled_monthly_summary_unique 
ON acled_monthly_event_summary(month, admin1, event_type, sub_event_type);

CREATE UNIQUE INDEX IF NOT EXISTS idx_acled_actor_summary_unique 
ON acled_actor_event_summary(actor_id);
```

---

## Best Practices

1. **Always use incremental update for weekly data**
   - Faster (skips duplicates)
   - Safer (won't cause errors)
   - Shows what's new

2. **Keep your CSV files organized**
   ```
   acled_data/
   ├── initial/
   │   └── ACLED_Myanmar_2010-2026_Initial.csv
   └── weekly/
       ├── ACLED_Myanmar_2026-01-25.csv
       ├── ACLED_Myanmar_2026-02-01.csv
       └── ACLED_Myanmar_2026-02-08.csv
   ```

3. **Monitor the statistics**
   - Check "New events inserted" count
   - Verify "Duplicate events" makes sense
   - Watch for unusual error counts

4. **Backup before major changes**
   ```bash
   pg_dump -h localhost -U postgres osint_news > backup_$(date +%Y%m%d).sql
   ```

---

## Common Commands

```bash
# Check database status
psql -h localhost -U postgres -d osint_news -c "
SELECT 'Events' as table, COUNT(*) FROM acled_events
UNION ALL SELECT 'Actors', COUNT(*) FROM acled_actors
UNION ALL SELECT 'Sources', COUNT(*) FROM acled_sources;
"

# Refresh materialized views manually
psql -h localhost -U postgres -d osint_news -c "SELECT refresh_acled_views();"

# Check latest events
psql -h localhost -U postgres -d osint_news -c "
SELECT event_id_cnty, event_date, event_type, admin1 
FROM acled_events 
ORDER BY event_date DESC 
LIMIT 10;
"
```
