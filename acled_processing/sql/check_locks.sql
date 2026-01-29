-- Check for locks and active queries on ACLED tables
-- Run this if cleanup is stuck

-- 1. Check for locks
SELECT 
    l.pid,
    l.mode,
    l.granted,
    a.usename,
    a.query,
    a.state,
    a.state_change,
    now() - a.query_start AS query_duration
FROM pg_locks l
JOIN pg_stat_activity a ON l.pid = a.pid
WHERE l.relation IN (
    SELECT oid FROM pg_class 
    WHERE relname LIKE 'acled_%'
)
ORDER BY query_duration DESC;

-- 2. If you see stuck queries, terminate them
-- Uncomment and run this to kill all ACLED-related connections:

/*
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = current_database()
  AND pid != pg_backend_pid()
  AND (
    query LIKE '%acled_%' 
    OR state = 'idle in transaction'
  );
*/

-- 3. After terminating, check again
SELECT 
    pid,
    usename,
    state,
    query
FROM pg_stat_activity
WHERE datname = current_database()
  AND pid != pg_backend_pid()
  AND query LIKE '%acled_%';
