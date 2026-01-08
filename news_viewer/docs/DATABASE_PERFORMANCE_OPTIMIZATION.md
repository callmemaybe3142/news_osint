# Database Performance Optimization

## Problem
The person details endpoint was taking **4-8 seconds** to fetch a small amount of data. This was caused by the **N+1 query problem** - making 7 separate database queries for each person:

1. Basic person info + ministry/department
2. Positions
3. Punishments
4. Addresses
5. Educations
6. Countries
7. Trainings

## Solution
Optimized to use a **single database query** with PostgreSQL's JSON aggregation functions.

### Before (7 queries):
```python
person = await db.fetch_one(person_query, person_id)
positions = await db.fetch_all(positions_query, person_id)
punishments = await db.fetch_all(punishments_query, person_id)
addresses = await db.fetch_all(addresses_query, person_id)
educations = await db.fetch_all(educations_query, person_id)
countries = await db.fetch_all(countries_query, person_id)
trainings = await db.fetch_all(trainings_query, person_id)
```

### After (1 query):
```sql
SELECT 
    p.*,
    d.department,
    d.ministry,
    -- Aggregate positions as JSON
    COALESCE(
        (
            SELECT json_agg(
                json_build_object(
                    'name', pos.position_name,
                    'rank', pos.rank
                ) ORDER BY pos.rank ASC NULLS LAST
            )
            FROM position_join pj
            INNER JOIN positions pos ON pj.position_id = pos.position_id
            WHERE pj.person_id = p.id
        ),
        '[]'::json
    ) as positions,
    -- ... (similar for punishments, addresses, educations, countries, trainings)
FROM person p
LEFT JOIN md_join md ON p.id = md.person_id
LEFT JOIN departments d ON md.department_id = d.department_id
WHERE p.id = $1
LIMIT 1
```

## Performance Improvements

### Expected Results:
- **Before**: 4-8 seconds (7 round trips to database)
- **After**: <100ms (1 round trip to database)
- **Improvement**: ~40-80x faster! 🚀

### Why This Works:
1. **Reduced Network Latency**: 1 round trip instead of 7
2. **Database Efficiency**: PostgreSQL can optimize a single complex query better than multiple simple ones
3. **JSON Aggregation**: Built-in PostgreSQL functions are highly optimized
4. **Connection Pool**: Only acquires 1 connection instead of 7

## Technical Details

### JSON Aggregation Functions Used:
- `json_agg()`: Aggregates rows into a JSON array
- `json_build_object()`: Creates JSON objects from key-value pairs
- `COALESCE()`: Returns empty array `[]` if no results (prevents NULL)

### Key Features:
- ✅ Maintains sorting (ORDER BY in subqueries)
- ✅ Handles empty results gracefully (COALESCE to `[]`)
- ✅ Preserves data types
- ✅ Single transaction
- ✅ No N+1 query problem

## Additional Optimization Opportunities

If performance is still not satisfactory, consider:

1. **Add Indexes** (if not already present):
   ```sql
   CREATE INDEX idx_position_join_person_id ON position_join(person_id);
   CREATE INDEX idx_punishment_join_person_id ON punishment_join(person_id);
   CREATE INDEX idx_addresses_person_id ON addresses(person_id);
   CREATE INDEX idx_education_join_person_id ON education_join(person_id);
   CREATE INDEX idx_country_join_person_id ON country_join(person_id);
   CREATE INDEX idx_trainings_person_id ON trainings(person_id);
   ```

2. **Materialized View** (for frequently accessed data):
   ```sql
   CREATE MATERIALIZED VIEW person_details_cache AS
   SELECT ... (the optimized query)
   ```

3. **Redis Caching**: Cache person details for 5-10 minutes

4. **Database Connection Pooling**: Already using asyncpg pool (configured in database.py)

## Testing

To verify the performance improvement:

1. Check query execution time in PostgreSQL:
   ```sql
   EXPLAIN ANALYZE
   SELECT ... (the query)
   ```

2. Monitor backend logs for response times

3. Use browser DevTools Network tab to measure API response time

## Files Modified
- `backend/routes/person/search.py` - Optimized `get_person_details()` function
