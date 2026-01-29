# ACLED Aggregated Weekly Data - Import Guide

## Overview

The `acled_aggregated` table stores weekly aggregated ACLED conflict data for Myanmar, including event counts, fatalities, and population exposure by administrative region and event type.

---

## Table Structure

```sql
CREATE TABLE acled_aggregated (
    aggregated_id SERIAL PRIMARY KEY,
    week DATE NOT NULL,
    admin1 VARCHAR(100),
    event_type VARCHAR(100),
    sub_event_type VARCHAR(100),
    events INTEGER DEFAULT 0,
    fatalities INTEGER DEFAULT 0,
    population_exposure INTEGER DEFAULT 0,
    disorder_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(week, admin1, event_type, sub_event_type)
);
```

### Key Features

- **Unique Constraint**: Prevents duplicate entries for the same week/region/event type combination
- **Indexes**: Optimized for queries by week, admin1, event_type
- **Data Validation**: CHECK constraints ensure non-negative values for counts

---

## Setup

### 1. Create the Table

```bash
psql -U your_user -d your_database -f sql/create_acled_aggregated.sql
```

### 2. Install Python Dependencies

```bash
pip install pandas openpyxl psycopg2-binary python-dotenv
```

### 3. Configure Database Connection

Create or update your `.env` file:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=osint_news
DB_USER=postgres
DB_PASSWORD=your_password
```

---

## Incremental Import Feature

The script automatically tracks the last imported week and uses it for subsequent imports, making it easy to update with new data without re-importing everything.

### How It Works

1. **First Import**: Imports all Myanmar data from the Excel file
2. **Saves State**: Stores the latest week date in `.last_import_state.json`
3. **Next Import**: Automatically uses the saved date as `--start-date`
4. **Only New Data**: Imports only weeks after the last import

### State File

The script creates a hidden file `.last_import_state.json` in the same directory:

```json
{
  "last_week": "2026-01-04",
  "last_import_timestamp": "2026-01-28T12:00:00"
}
```

### Import Modes

| Mode | Command | Behavior |
|------|---------|----------|
| **First Import** | `--file data.xlsx` | Imports all data, saves last week |
| **Incremental** | `--file data.xlsx` | Uses saved date, imports only new weeks |
| **Custom Date** | `--file data.xlsx --start-date 2024-01-01` | Uses specified date, updates saved state |
| **Force All** | `--file data.xlsx --force-all` | Ignores saved state, imports all data |

---

## Importing Data

### First Time Import

Import all Myanmar data from the Excel file:

```bash
python import_aggregated_data.py --file data/aggregated-2026-01-10.xlsx
```

**What happens:**
- Imports all Myanmar data
- Saves last week date (e.g., "2026-01-04")
- Creates `.last_import_state.json`

### Subsequent Imports (Automatic Incremental)

Simply run with the new file:

```bash
python import_aggregated_data.py --file data/aggregated-2026-01-17.xlsx
```

**What happens:**
- Loads last import date from state file
- Imports only weeks after that date
- Updates state file with new last week

### Manual Date Override

Specify a custom start date:

```bash
python import_aggregated_data.py --file data/aggregated-2026-01-10.xlsx --start-date 2024-01-01
```

**What happens:**
- Uses your specified date
- Ignores saved state
- Updates state file after import

### Force Re-import All Data

Import everything, ignoring saved state:

```bash
python import_aggregated_data.py --file data/aggregated-2026-01-10.xlsx --force-all
```

**What happens:**
- Imports all Myanmar data
- Ignores saved state
- Updates state file with latest week

### Preview Before Importing

```bash
python import_aggregated_data.py --file data/aggregated-2026-01-10.xlsx --dry-run
```

**What happens:**
- Shows what would be imported
- Does NOT save state
- Does NOT insert into database

---

## Basic Usage

### Import all Myanmar data

Import all Myanmar data from the Excel file:

```bash
python import_aggregated_data.py --file data/aggregated-2026-01-10.xlsx
```

### Filter by Start Date

Import only data from a specific date onwards:

```bash
python import_aggregated_data.py --file data/aggregated-2026-01-10.xlsx --start-date 2024-01-01
```

### Dry Run (Preview Only)

Preview what would be imported without actually inserting data:

```bash
python import_aggregated_data.py --file data/aggregated-2026-01-10.xlsx --dry-run
```

### Combined Example

```bash
python import_aggregated_data.py \
    --file data/aggregated-2026-01-10.xlsx \
    --start-date 2023-01-01 \
    --dry-run
```

---

## Command Line Arguments

| Argument | Required | Description | Example |
|----------|----------|-------------|---------|
| `--file` | Yes | Path to Excel file | `data/aggregated-2026-01-10.xlsx` |
| `--start-date` | No | Filter data from this date onwards (YYYY-MM-DD). Overrides saved state. | `2024-01-01` |
| `--dry-run` | No | Preview without inserting or saving state | (flag, no value) |
| `--force-all` | No | Import all data, ignoring saved state | (flag, no value) |

---

## Excel File Format

The script expects an Excel file with the following structure:

### Sheet Name
- **Sheet 1**

### Required Columns (from Excel)

The Excel file must contain these columns (script filters for Myanmar and extracts only needed data):

**Columns Used for Import:**
- `WEEK` - Date in format "31-December-2016" → Imported as `week`
- `ADMIN1` - State/Region → Imported as `admin1`
- `EVENT_TYPE` - Main event category → Imported as `event_type`
- `SUB_EVENT_TYPE` - Event sub-category → Imported as `sub_event_type`
- `EVENTS` - Number of events → Imported as `events`
- `FATALITIES` - Number of fatalities → Imported as `fatalities`
- `POPULATION_EXPOSURE` - Estimated population exposed → Imported as `population_exposure`
- `DISORDER_TYPE` - Type of disorder → Imported as `disorder_type`

**Columns Used for Filtering Only (not imported):**
- `COUNTRY` - Used to filter for "Myanmar" only
- `REGION` - Not imported (same value for all Myanmar data)
- `ID` - Not imported (redundant)
- `CENTROID_LATITUDE` - Not imported (same for each admin1)
- `CENTROID_LONGITUDE` - Not imported (same for each admin1)

### Example Data

```csv
WEEK,REGION,COUNTRY,ADMIN1,EVENT_TYPE,SUB_EVENT_TYPE,EVENTS,FATALITIES,POPULATION_EXPOSURE
31-December-2016,Southeast Asia,Myanmar,Sagaing,Battles,Armed clash,6,15,113469
07-January-2017,Southeast Asia,Myanmar,Sagaing,Battles,Armed clash,5,28,155849
```

---

## Import Process

The script performs the following steps:

1. **Read Excel File** - Loads data from "Sheet 1"
2. **Filter for Myanmar** - Keeps only rows where COUNTRY = "Myanmar"
3. **Date Filtering** - If `--start-date` is specified, filters WEEK column
4. **Data Validation** - Converts data types, handles missing values
5. **Preview** - Shows summary statistics and sample data
6. **Confirmation** - Asks for user confirmation (unless `--dry-run`)
7. **Insert** - Uses `ON CONFLICT DO NOTHING` to skip duplicates
8. **Report** - Shows rows inserted, skipped, and database statistics

---

## Handling Duplicates

The table has a unique constraint on `(week, admin1, event_type, sub_event_type)`.

When importing:
- **Duplicate rows** are automatically skipped (no error)
- **New rows** are inserted
- **Existing rows** are not updated

This allows you to:
- Re-run imports safely
- Import overlapping datasets
- Update with new weekly data

---

## Example Output

```
================================================================================
ACLED Aggregated Data Import for Myanmar
================================================================================
File: data/aggregated-2026-01-10.xlsx

================================================================================
Reading Excel file: data/aggregated-2026-01-10.xlsx
================================================================================
Total rows in file: 45,234
Columns: ['WEEK', 'REGION', 'COUNTRY', 'ADMIN1', ...]

Myanmar rows: 1,523

Rows after filtering by start date (2024-01-01): 856

================================================================================
Data Summary:
================================================================================
Date range: 2024-01-06 to 2026-01-04
Total events: 3,456
Total fatalities: 1,234
Unique admin1 regions: 15
Unique event types: 6

================================================================================
✅ Import completed successfully!
================================================================================
Rows processed: 856
Rows inserted: 823
Rows skipped (duplicates): 33

================================================================================
Database Statistics (Myanmar data):
================================================================================
Total rows in database: 2,345
Date range: 2017-01-01 to 2026-01-04
Total events: 12,345
Total fatalities: 5,678
```

---

## Useful Queries

### Weekly Event Trends

```sql
SELECT 
    week,
    SUM(events) as total_events,
    SUM(fatalities) as total_fatalities,
    SUM(population_exposure) as total_exposure
FROM acled_aggregated
GROUP BY week
ORDER BY week DESC
LIMIT 52;  -- Last year
```

### Events by Region

```sql
SELECT 
    admin1,
    SUM(events) as total_events,
    SUM(fatalities) as total_fatalities
FROM acled_aggregated
WHERE week >= '2024-01-01'
GROUP BY admin1
ORDER BY total_events DESC;
```

### Events by Type

```sql
SELECT 
    event_type,
    sub_event_type,
    SUM(events) as total_events,
    SUM(fatalities) as total_fatalities
FROM acled_aggregated
WHERE week >= CURRENT_DATE - INTERVAL '3 months'
GROUP BY event_type, sub_event_type
ORDER BY total_events DESC;
```

### Monthly Aggregation

```sql
SELECT 
    DATE_TRUNC('month', week) as month,
    admin1,
    SUM(events) as monthly_events,
    SUM(fatalities) as monthly_fatalities
FROM acled_aggregated
GROUP BY month, admin1
ORDER BY month DESC, monthly_events DESC;
```

### Hotspot Analysis

```sql
SELECT 
    admin1,
    week,
    SUM(events) as weekly_events,
    SUM(fatalities) as weekly_fatalities,
    SUM(population_exposure) as weekly_exposure
FROM acled_aggregated
WHERE week >= CURRENT_DATE - INTERVAL '4 weeks'
GROUP BY admin1, week
HAVING SUM(events) > 10
ORDER BY weekly_events DESC;
```

---

## Troubleshooting

### File Not Found
```
❌ Error: File not found: data/aggregated-2026-01-10.xlsx
```
**Solution**: Check the file path and ensure the file exists.

### No Myanmar Data
```
⚠️  No Myanmar data found in the file!
```
**Solution**: Verify the COUNTRY column contains "Myanmar" (case-sensitive).

### Database Connection Error
```
❌ Database error: could not connect to server
```
**Solution**: Check your `.env` file and ensure PostgreSQL is running.

### Duplicate Key Error
This shouldn't happen due to `ON CONFLICT DO NOTHING`, but if it does:
**Solution**: Check the unique constraint on the table.

---

## Files

- **`sql/create_acled_aggregated.sql`** - Table creation script
- **`import_aggregated_data.py`** - Data import script
- **`AGGREGATED_DATA_GUIDE.md`** - This documentation

---

## Notes

- The script automatically converts date formats from "DD-Month-YYYY" to DATE
- Missing values in numeric columns are converted to 0
- The unique constraint ensures data integrity
- All imports are transactional (all or nothing)
- The script provides detailed progress and statistics
