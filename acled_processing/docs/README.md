# ACLED Data Import for PostgreSQL

This directory contains scripts to import ACLED (Armed Conflict Location & Event Data) for Myanmar into a PostgreSQL database.

## Files

- `schema_acled.sql` - PostgreSQL schema with optimized indexes
- `import_acled_data.py` - Python script to import CSV data
- `.env.example` - Example environment configuration

## Setup

### 1. Install Dependencies

```bash
pip install psycopg2-binary python-dotenv pandas tqdm
```

### 2. Configure Database Connection

Copy `.env.example` to `.env` and update with your database credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=osint_news
DB_USER=postgres
DB_PASSWORD=your_password
```

### 3. Create Database Schema

Run the SQL schema to create tables and indexes:

```bash
psql -h localhost -U postgres -d osint_news -f schema_acled.sql
```

Or using pgAdmin or any PostgreSQL client.

## Usage

### Import CSV Data

**Initial bulk import** (first time):

```bash
python import_acled_data.py "ACLED Data_2026-01-25.csv"
```

**Weekly incremental updates** (for new data):

```bash
python update_acled_data.py "ACLED Data_Weekly_2026-02-01.csv"
```

### Difference Between Scripts

| Feature | `import_acled_data.py` | `update_acled_data.py` |
|---------|------------------------|------------------------|
| **Use case** | Initial bulk import | Weekly updates |
| **Duplicates** | Assumes clean data | Skips existing events |
| **Actors/Sources** | Creates all new | Reuses existing, adds new |
| **Speed** | Very fast (bulk) | Fast (only new data) |
| **When to use** | First import or full reload | Regular weekly updates |

### Import Process

**Initial Import (`import_acled_data.py`):**
1. ✓ Load entire CSV file
2. ✓ Collect all unique actors and sources
3. ✓ Bulk insert all actors
4. ✓ Bulk insert all sources
5. ✓ Bulk insert all events
6. ✓ Link actors and sources to events
7. ✓ Refresh materialized views

**Incremental Update (`update_acled_data.py`):**
1. ✓ Load CSV file
2. ✓ Check existing events in database
3. ✓ Filter out duplicate events
4. ✓ Load existing actors and sources
5. ✓ Insert only NEW actors and sources
6. ✓ Insert only NEW events
7. ✓ Link relationships
8. ✓ Refresh materialized views

## Database Schema

### Main Tables

- **acled_events** - Main event data (denormalized for performance)
- **acled_actors** - Normalized actor names
- **acled_event_actors** - Links events to actors (many-to-many)
- **acled_sources** - Normalized source names
- **acled_event_sources** - Links events to sources (many-to-many)

### Indexes

All tables have optimized indexes for:
- Date filtering (`event_date`)
- Event type filtering (`event_type`, `sub_event_type`)
- Interaction codes (`interaction_code`)
- Location filtering (`admin1`, `admin2`, `admin3`)
- Full-text search on news content (`notes`)
- Actor and source lookups

### Materialized Views

- **acled_monthly_event_summary** - Pre-aggregated monthly statistics
- **acled_actor_event_summary** - Actor involvement statistics

## Example Queries

### Full-text search in news content

```sql
SELECT event_id_cnty, event_date, admin1, notes
FROM acled_events
WHERE to_tsvector('english', notes) @@ to_tsquery('english', 'military & attack');
```

### Events by actor

```sql
SELECT e.event_id_cnty, e.event_date, e.event_type, a.actor_name
FROM acled_events e
JOIN acled_event_actors ea ON e.event_id = ea.event_id
JOIN acled_actors a ON ea.actor_id = a.actor_id
WHERE a.actor_name LIKE '%Karen National%';
```

### Events with multiple sources

```sql
SELECT e.event_id_cnty, e.event_date, COUNT(es.source_id) as source_count
FROM acled_events e
JOIN acled_event_sources es ON e.event_id = es.event_id
GROUP BY e.event_id, e.event_id_cnty, e.event_date
HAVING COUNT(es.source_id) > 1;
```

### Timeline of events by type

```sql
SELECT event_date, event_type, COUNT(*) as count
FROM acled_events
WHERE event_date >= '2020-01-01'
GROUP BY event_date, event_type
ORDER BY event_date;
```

### Refresh materialized views

```sql
SELECT refresh_acled_views();
```

## Data Fields

### Event Classification
- `event_id_cnty` - Unique ACLED event ID
- `event_date` - Event date
- `time_precision` - 1=exact, 2=approximate, 3=range
- `disorder_type` - Type of disorder
- `event_type` - Main event category
- `sub_event_type` - Detailed event type
- `civilian_targeting` - Boolean flag
- `interaction_code` - Interaction code

### Location
- `admin1` - State/Region
- `admin2` - District
- `admin3` - Township
- `location` - Specific location name
- `latitude`, `longitude` - Coordinates
- `geo_precision` - Geographic precision

### Event Details
- `notes` - News text content
- `fatalities` - Number of fatalities
- `tags` - Event tags
- `source_scale` - Source scale category

### Population Data
- `population_1km`, `population_2km`, `population_5km` - Population within radius
- `population_best` - Best population estimate

## Performance Tips

1. **Batch Size**: Adjust `--batch-size` based on your system (default: 500)
2. **Indexes**: All indexes are created automatically by the schema
3. **Materialized Views**: Refresh after bulk imports for updated statistics
4. **Full-text Search**: Use GIN index for fast text searches

## Troubleshooting

### Connection Issues
- Check `.env` file has correct credentials
- Ensure PostgreSQL is running
- Verify database exists

### Import Errors
- Check CSV file encoding (should be UTF-8)
- Verify CSV has all required columns
- Check for date format issues (should be m/d/yyyy)

### Performance Issues
- Increase batch size for faster imports
- Ensure sufficient disk space
- Monitor PostgreSQL logs for errors

## License

ACLED data is subject to ACLED's terms of use. Please refer to https://acleddata.com for licensing information.
