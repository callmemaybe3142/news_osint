# Transfer Person Data: Supabase → VPS PostgreSQL

## Quick Manual Guide

### Prerequisites
- PostgreSQL client tools installed on your local machine
- SSH access to your VPS
- Supabase connection details
- VPS database credentials

---

## Method 1: Using the Automated Script (Recommended)

1. **Edit the configuration** in `transfer_supabase_to_vps.ps1`:
   ```powershell
   # Supabase Configuration
   $SUPABASE_HOST = "db.xxxxxxxxxxxxx.supabase.co"
   $SUPABASE_PASSWORD = "your-supabase-password"
   
   # VPS Configuration
   $VPS_HOST = "your.vps.ip.address"
   $VPS_SSH_USER = "your_ssh_user"
   $VPS_DB_USER = "your_db_user"
   $VPS_DB_PASSWORD = "your_vps_db_password"
   ```

2. **Run the script**:
   ```powershell
   cd d:\JOB\PROJECTS\news_osint\news_viewer
   .\transfer_supabase_to_vps.ps1
   ```

3. **Wait for completion** - The script will:
   - Export data from Supabase
   - Upload to VPS
   - Create schema
   - Import data
   - Reset sequences
   - Verify transfer

---

## Method 2: Manual Step-by-Step

### Step 1: Export from Supabase

```powershell
# From your local machine
cd d:\JOB\PROJECTS\news_osint\news_viewer

# Set Supabase password
$env:PGPASSWORD = "your-supabase-password"

# Export data
pg_dump -h db.xxxxxxxxxxxxx.supabase.co -p 5432 -U postgres -d postgres `
  --data-only `
  --format=custom `
  --file=person_data.dump `
  --table=person `
  --table=addresses `
  --table=countries `
  --table=country_join `
  --table=departments `
  --table=educations `
  --table=education_join `
  --table=ministries `
  --table=md_join `
  --table=positions `
  --table=position_join `
  --table=punishments `
  --table=punishment_join `
  --table=trainings
```

### Step 2: Upload to VPS

```powershell
# Upload schema file
scp schema_person.sql your_user@your_vps_ip:/tmp/

# Upload dump file
scp person_data.dump your_user@your_vps_ip:/tmp/
```

### Step 3: Create Schema on VPS

```bash
# SSH to VPS
ssh your_user@your_vps_ip

# Create schema
export PGPASSWORD='your_vps_db_password'
psql -U your_db_user -d telegram_news -f /tmp/schema_person.sql
```

### Step 4: Import Data

```bash
# Still on VPS
pg_restore -U postgres -d osint_news \
  --data-only \
  --disable-triggers \
  --no-owner \
  --verbose \
  /tmp/person_data.dump
```

### Step 5: Reset Sequences

```bash
# Still on VPS
psql -U your_db_user -d telegram_news -c "
SELECT setval('addresses_id_seq', COALESCE((SELECT MAX(id) FROM addresses), 1));
SELECT setval('countries_country_id_seq', COALESCE((SELECT MAX(country_id) FROM countries), 1));
SELECT setval('departments_department_id_seq', COALESCE((SELECT MAX(department_id) FROM departments), 1));
SELECT setval('educations_education_id_seq', COALESCE((SELECT MAX(education_id) FROM educations), 1));
SELECT setval('ministries_ministry_id_seq', COALESCE((SELECT MAX(ministry_id) FROM ministries), 1));
SELECT setval('positions_position_id_seq', COALESCE((SELECT MAX(position_id) FROM positions), 1));
SELECT setval('punishments_punishment_id_seq', COALESCE((SELECT MAX(punishment_id) FROM punishments), 1));
SELECT setval('trainings_id_seq', COALESCE((SELECT MAX(id) FROM trainings), 1));
"
```

### Step 6: Verify

```bash
# Check record counts
psql -U your_db_user -d telegram_news -c "
SELECT 'person' as table_name, COUNT(*) as records FROM person
UNION ALL SELECT 'addresses', COUNT(*) FROM addresses
UNION ALL SELECT 'countries', COUNT(*) FROM countries
UNION ALL SELECT 'country_join', COUNT(*) FROM country_join
UNION ALL SELECT 'departments', COUNT(*) FROM departments
UNION ALL SELECT 'educations', COUNT(*) FROM educations
UNION ALL SELECT 'education_join', COUNT(*) FROM education_join
UNION ALL SELECT 'ministries', COUNT(*) FROM ministries
UNION ALL SELECT 'md_join', COUNT(*) FROM md_join
UNION ALL SELECT 'positions', COUNT(*) FROM positions
UNION ALL SELECT 'position_join', COUNT(*) FROM position_join
UNION ALL SELECT 'punishments', COUNT(*) FROM punishments
UNION ALL SELECT 'punishment_join', COUNT(*) FROM punishment_join
UNION ALL SELECT 'trainings', COUNT(*) FROM trainings;
"
```

### Step 7: Cleanup

```bash
# On VPS
rm /tmp/person_data.dump /tmp/schema_person.sql

# On local machine
rm person_data.dump
```

---

## Alternative: Direct VPS Export (No Local Download)

If you want to avoid downloading to your local machine:

```bash
# SSH to VPS
ssh your_user@your_vps_ip

# Export directly from Supabase to VPS
cd /tmp
export PGPASSWORD='your-supabase-password'

pg_dump -h db.xxxxxxxxxxxxxxxxxxxxxxxx.supabase.co -p 5432 -U postgres -d postgres \
  --data-only \
  --format=custom \
  --file=person_data.dump \
  --table=person \
  --table=addresses \
  --table=countries \
  --table=country_join \
  --table=departments \
  --table=educations \
  --table=education_join \
  --table=ministries \
  --table=md_join \
  --table=positions \
  --table=position_join \
  --table=punishments \
  --table=punishment_join \
  --table=trainings

# Then continue with Step 3 above
```

---

## Troubleshooting

### Connection Issues
- Ensure Supabase allows connections from your IP
- Check if VPS firewall allows PostgreSQL port (5432)
- Verify credentials are correct

### Import Errors
- Some constraint errors are normal if data already exists
- Use `--clean` flag with pg_restore to drop existing data first
- Check PostgreSQL logs: `tail -f /var/log/postgresql/postgresql-*.log`

### Sequence Issues
- If you get "duplicate key" errors when inserting new records, sequences weren't reset
- Re-run the sequence reset commands from Step 5

---

## Next Steps

After successful transfer:

1. **Update backend .env** to point to VPS database
2. **Test the application** with the new database
3. **Backup the data** on VPS regularly
4. **Consider disabling Supabase database** if no longer needed

---

## Backup Command (for future use)

```bash
# On VPS - create regular backups
pg_dump -U your_db_user -d telegram_news \
  --format=custom \
  --file=/backups/telegram_news_$(date +%Y%m%d).dump
```
