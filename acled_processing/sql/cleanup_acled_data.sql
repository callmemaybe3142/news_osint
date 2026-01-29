-- Clean up ACLED data - IMPROVED VERSION
-- This script handles locks and uses DROP/RECREATE for faster cleanup

-- First, terminate any active connections/transactions on these tables
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = current_database()
  AND pid != pg_backend_pid()
  AND state = 'active'
  AND query LIKE '%acled_%';

-- Wait a moment for connections to close
SELECT pg_sleep(1);

-- Drop and recreate tables (faster than TRUNCATE for large datasets)
-- This also clears any locks

-- Drop junction tables first
DROP TABLE IF EXISTS acled_event_actors CASCADE;
DROP TABLE IF EXISTS acled_event_sources CASCADE;

-- Drop main tables
DROP TABLE IF EXISTS acled_events CASCADE;
DROP TABLE IF EXISTS acled_actors CASCADE;
DROP TABLE IF EXISTS acled_sources CASCADE;

-- Drop materialized views
DROP MATERIALIZED VIEW IF EXISTS acled_monthly_event_summary CASCADE;
DROP MATERIALIZED VIEW IF EXISTS acled_actor_event_summary CASCADE;

-- Now recreate everything from schema
-- You'll need to run the schema file after this

-- Show completion message
SELECT 'All ACLED tables and views have been dropped!' as status;
SELECT 'Next step: Run schema_acled.sql to recreate the tables' as next_step;
