import { query } from "./db";
import { EventData, EventFilters, PaginatedEvents, EventActor, EventSource } from "./event-types";

/**
 * Fetch paginated events with optional filters
 */
export async function getEvents(filters: EventFilters = {}): Promise<PaginatedEvents> {
    try {
        const {
            startDate,
            endDate,
            actorId,
            interactionCode,
            admin1,
            admin2,
            admin3,
            eventType,
            subEventType,
            searchText,
            searchOperator = 'and',
            page = 1,
            limit = 20,
        } = filters;

        const offset = (page - 1) * limit;
        const conditions: string[] = [];
        const params: any[] = [];
        let paramIndex = 1;

        // Date range filter
        if (startDate) {
            conditions.push(`e.event_date >= $${paramIndex}`);
            params.push(startDate);
            paramIndex++;
        }
        if (endDate) {
            conditions.push(`e.event_date <= $${paramIndex}`);
            params.push(endDate);
            paramIndex++;
        }

        // Actor filter (check if actor is involved in the event)
        if (actorId) {
            conditions.push(`EXISTS (
      SELECT 1 FROM acled_event_actors ea 
      WHERE ea.event_id = e.event_id AND ea.actor_id = $${paramIndex}
    )`);
            params.push(actorId);
            paramIndex++;
        }

        // Interaction code filter
        if (interactionCode) {
            conditions.push(`e.interaction_code = $${paramIndex}`);
            params.push(interactionCode);
            paramIndex++;
        }

        // Location filters
        if (admin1) {
            conditions.push(`e.admin1 = $${paramIndex}`);
            params.push(admin1);
            paramIndex++;
        }
        if (admin2) {
            conditions.push(`e.admin2 = $${paramIndex}`);
            params.push(admin2);
            paramIndex++;
        }
        if (admin3) {
            conditions.push(`e.admin3 = $${paramIndex}`);
            params.push(admin3);
            paramIndex++;
        }

        // Event type filters
        if (eventType) {
            conditions.push(`e.event_type = $${paramIndex}`);
            params.push(eventType);
            paramIndex++;
        }
        if (subEventType) {
            conditions.push(`e.sub_event_type = $${paramIndex}`);
            params.push(subEventType);
            paramIndex++;
        }

        // Full-text search on notes
        if (searchText && searchText.trim()) {
            const keywords = searchText.split(',').map(k => k.trim()).filter(k => k);
            if (keywords.length > 0) {
                if (searchOperator === 'and') {
                    // All keywords must be present
                    const tsQuery = keywords.map(k => k.replace(/\s+/g, ' & ')).join(' & ');
                    conditions.push(`to_tsvector('english', e.notes) @@ to_tsquery('english', $${paramIndex})`);
                    params.push(tsQuery);
                    paramIndex++;
                } else {
                    // Any keyword can be present
                    const tsQuery = keywords.map(k => k.replace(/\s+/g, ' & ')).join(' | ');
                    conditions.push(`to_tsvector('english', e.notes) @@ to_tsquery('english', $${paramIndex})`);
                    params.push(tsQuery);
                    paramIndex++;
                }
            }
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Count total matching events
        const countQuery = `
    SELECT COUNT(*) as total
    FROM acled_events e
    ${whereClause}
  `;
        const countResult = await query(countQuery, params);
        const total = countResult.rows && countResult.rows[0] ? parseInt(countResult.rows[0].total, 10) : 0;

        // Fetch events with interaction title
        const eventsQuery = `
    SELECT 
      e.event_id, e.event_id_cnty, e.event_date,
      e.event_type, e.sub_event_type, e.interaction_code,
      i.title as interaction_title,
      e.civilian_targeting, e.admin1, e.admin2, e.admin3,
      e.location, e.latitude, e.longitude,
      e.notes, e.fatalities, e.population_best, e.tags
    FROM acled_events e
    LEFT JOIN acled_interactions i ON e.interaction_code::integer = i.code
    ${whereClause}
    ORDER BY e.event_date DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
        params.push(limit, offset);

        const eventsResult = await query(eventsQuery, params);

        // Fetch actors and sources for each event
        const events: EventData[] = await Promise.all(
            (eventsResult.rows || []).map(async (row: any) => {
                const actors = await getEventActors(row.event_id);
                const sources = await getEventSources(row.event_id);

                return {
                    ...row,
                    actors,
                    sources,
                };
            })
        );

        const totalPages = Math.ceil(total / limit);

        return {
            events,
            total,
            page,
            limit,
            totalPages,
        };
    } catch (error) {
        console.error("Error fetching events:", error);
        // Return empty result on error
        return {
            events: [],
            total: 0,
            page: 1,
            limit: 20,
            totalPages: 0,
        };
    }
}

/**
 * Fetch actors for a specific event
 */
async function getEventActors(eventId: number): Promise<EventActor[]> {
    const actorsQuery = `
    SELECT a.actor_id, a.actor_name, ea.actor_role, ea.is_associated
    FROM acled_event_actors ea
    JOIN acled_actors a ON ea.actor_id = a.actor_id
    WHERE ea.event_id = $1
    ORDER BY ea.actor_role, ea.is_associated
  `;
    const result = await query(actorsQuery, [eventId]);
    return result.rows;
}

/**
 * Fetch sources for a specific event
 */
async function getEventSources(eventId: number): Promise<EventSource[]> {
    const sourcesQuery = `
    SELECT s.source_id, s.source_name
    FROM acled_event_sources es
    JOIN acled_sources s ON es.source_id = s.source_id
    WHERE es.event_id = $1
  `;
    const result = await query(sourcesQuery, [eventId]);
    return result.rows;
}
