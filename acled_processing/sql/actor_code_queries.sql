-- Common queries for working with actor_code column
-- ACLED Actor Code Reference Queries

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if actor_code column exists
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'acled_actors' 
AND column_name = 'actor_code';

-- Count actors by code
SELECT 
    ac.code,
    ac.description,
    COUNT(a.actor_id) as actor_count
FROM acled_actor_codes ac
LEFT JOIN acled_actors a ON a.actor_code = ac.code
GROUP BY ac.code, ac.description
ORDER BY ac.code;

-- Find actors without codes
SELECT 
    actor_id,
    actor_name,
    actor_type
FROM acled_actors 
WHERE actor_code IS NULL
ORDER BY actor_name;

-- Count actors without codes
SELECT COUNT(*) as actors_without_code
FROM acled_actors 
WHERE actor_code IS NULL;

-- ============================================================================
-- ACTOR QUERIES BY CODE
-- ============================================================================

-- Get all State Forces (code 1)
SELECT actor_name
FROM acled_actors
WHERE actor_code = 1
ORDER BY actor_name;

-- Get all Rebel Groups (code 2)
SELECT actor_name
FROM acled_actors
WHERE actor_code = 2
ORDER BY actor_name;

-- Get all Civilians (code 7)
SELECT actor_name
FROM acled_actors
WHERE actor_code = 7
ORDER BY actor_name;

-- ============================================================================
-- ACTOR CODE ANALYSIS
-- ============================================================================

-- Actors with their code descriptions
SELECT 
    a.actor_name,
    a.actor_code,
    ac.description as code_description,
    ac.notes
FROM acled_actors a
LEFT JOIN acled_actor_codes ac ON a.actor_code = ac.code
ORDER BY a.actor_code, a.actor_name;

-- Top 20 most active actors by code
SELECT 
    a.actor_name,
    a.actor_code,
    ac.description,
    COUNT(DISTINCT ea.event_id) as event_count
FROM acled_actors a
JOIN acled_event_actors ea ON a.actor_id = ea.actor_id
LEFT JOIN acled_actor_codes ac ON a.actor_code = ac.code
GROUP BY a.actor_id, a.actor_name, a.actor_code, ac.description
ORDER BY event_count DESC
LIMIT 20;

-- ============================================================================
-- EVENT QUERIES USING ACTOR CODES
-- ============================================================================

-- Events involving State Forces (code 1)
SELECT 
    e.event_date,
    e.event_type,
    e.admin1,
    a.actor_name,
    e.fatalities
FROM acled_events e
JOIN acled_event_actors ea ON e.event_id = ea.event_id
JOIN acled_actors a ON ea.actor_id = a.actor_id
WHERE a.actor_code = 1
ORDER BY e.event_date DESC
LIMIT 100;

-- Events between State Forces and Rebel Groups
SELECT 
    e.event_date,
    e.event_type,
    e.admin1,
    a1.actor_name as actor1_name,
    a2.actor_name as actor2_name,
    e.fatalities
FROM acled_events e
JOIN acled_event_actors ea1 ON e.event_id = ea1.event_id AND ea1.actor_role = 1
JOIN acled_actors a1 ON ea1.actor_id = a1.actor_id
JOIN acled_event_actors ea2 ON e.event_id = ea2.event_id AND ea2.actor_role = 2
JOIN acled_actors a2 ON ea2.actor_id = a2.actor_id
WHERE a1.actor_code = 1 AND a2.actor_code = 2
ORDER BY e.event_date DESC
LIMIT 100;

-- Events targeting civilians (code 7)
SELECT 
    e.event_date,
    e.event_type,
    e.sub_event_type,
    e.admin1,
    a1.actor_name as perpetrator,
    e.fatalities
FROM acled_events e
JOIN acled_event_actors ea1 ON e.event_id = ea1.event_id AND ea1.actor_role = 1
JOIN acled_actors a1 ON ea1.actor_id = a1.actor_id
JOIN acled_event_actors ea2 ON e.event_id = ea2.event_id AND ea2.actor_role = 2
JOIN acled_actors a2 ON ea2.actor_id = a2.actor_id
WHERE a2.actor_code = 7 AND e.civilian_targeting = TRUE
ORDER BY e.event_date DESC
LIMIT 100;

-- ============================================================================
-- STATISTICS BY ACTOR CODE
-- ============================================================================

-- Total events and fatalities by actor code
SELECT 
    ac.code,
    ac.description,
    COUNT(DISTINCT e.event_id) as total_events,
    SUM(e.fatalities) as total_fatalities,
    AVG(e.fatalities) as avg_fatalities_per_event
FROM acled_actor_codes ac
LEFT JOIN acled_actors a ON a.actor_code = ac.code
LEFT JOIN acled_event_actors ea ON a.actor_id = ea.actor_id
LEFT JOIN acled_events e ON ea.event_id = e.event_id
GROUP BY ac.code, ac.description
ORDER BY ac.code;

-- Monthly events by actor code
SELECT 
    DATE_TRUNC('month', e.event_date)::DATE as month,
    ac.description as actor_type,
    COUNT(DISTINCT e.event_id) as event_count
FROM acled_events e
JOIN acled_event_actors ea ON e.event_id = ea.event_id
JOIN acled_actors a ON ea.actor_id = a.actor_id
JOIN acled_actor_codes ac ON a.actor_code = ac.code
GROUP BY month, ac.code, ac.description
ORDER BY month DESC, ac.code
LIMIT 100;

-- Events by region and actor code
SELECT 
    e.admin1 as region,
    ac.description as actor_type,
    COUNT(DISTINCT e.event_id) as event_count,
    SUM(e.fatalities) as total_fatalities
FROM acled_events e
JOIN acled_event_actors ea ON e.event_id = ea.event_id
JOIN acled_actors a ON ea.actor_id = a.actor_id
JOIN acled_actor_codes ac ON a.actor_code = ac.code
WHERE e.admin1 IS NOT NULL
GROUP BY e.admin1, ac.code, ac.description
ORDER BY event_count DESC
LIMIT 50;

-- ============================================================================
-- INTERACTION PATTERNS
-- ============================================================================

-- Most common actor code interactions (who fights whom)
SELECT 
    ac1.description as actor1_type,
    ac2.description as actor2_type,
    COUNT(*) as interaction_count,
    SUM(e.fatalities) as total_fatalities
FROM acled_events e
JOIN acled_event_actors ea1 ON e.event_id = ea1.event_id AND ea1.actor_role = 1
JOIN acled_actors a1 ON ea1.actor_id = a1.actor_id
JOIN acled_actor_codes ac1 ON a1.actor_code = ac1.code
JOIN acled_event_actors ea2 ON e.event_id = ea2.event_id AND ea2.actor_role = 2
JOIN acled_actors a2 ON ea2.actor_id = a2.actor_id
JOIN acled_actor_codes ac2 ON a2.actor_code = ac2.code
GROUP BY ac1.code, ac1.description, ac2.code, ac2.description
ORDER BY interaction_count DESC
LIMIT 20;

-- ============================================================================
-- DATA QUALITY CHECKS
-- ============================================================================

-- Check for actors with multiple codes (shouldn't happen)
SELECT 
    actor_name,
    COUNT(DISTINCT actor_code) as code_count
FROM acled_actors
WHERE actor_code IS NOT NULL
GROUP BY actor_name
HAVING COUNT(DISTINCT actor_code) > 1;

-- Actors that appear in both actor1 and actor2 roles with different codes
WITH actor_codes_by_role AS (
    SELECT 
        a.actor_name,
        ea.actor_role,
        a.actor_code
    FROM acled_actors a
    JOIN acled_event_actors ea ON a.actor_id = ea.actor_id
    GROUP BY a.actor_name, ea.actor_role, a.actor_code
)
SELECT 
    a1.actor_name,
    a1.actor_code as code_as_actor1,
    a2.actor_code as code_as_actor2
FROM actor_codes_by_role a1
JOIN actor_codes_by_role a2 ON a1.actor_name = a2.actor_name
WHERE a1.actor_role = 1 AND a2.actor_role = 2 AND a1.actor_code != a2.actor_code;

-- ============================================================================
-- MANUAL UPDATE TEMPLATES
-- ============================================================================

-- Update a single actor
-- UPDATE acled_actors SET actor_code = 1 WHERE actor_name = 'Actor Name Here';

-- Update actors by pattern
-- UPDATE acled_actors SET actor_code = 7 WHERE actor_name LIKE '%Civilians%' AND actor_code IS NULL;

-- Update based on actor_type
-- UPDATE acled_actors SET actor_code = 2 WHERE actor_type = 'Rebel Group' AND actor_code IS NULL;

-- Bulk update from a list
-- UPDATE acled_actors SET actor_code = 1 
-- WHERE actor_name IN (
--     'Military Forces of Myanmar (1988-2011)',
--     'Police Forces of Myanmar (1988-2011)',
--     'Military Forces of Myanmar (2011-2016)'
-- );
