import { query } from "./db";
import { FilterOptions, AggregatedChartData } from "./types";

/**
 * Fetch filter options (admin1, event types, sub event types)
 */
export async function getFilterOptions(): Promise<FilterOptions> {
    try {
        // Fetch unique admin1s
        const admin1Query = `
      SELECT DISTINCT admin1 
      FROM acled_locations 
      WHERE admin1 IS NOT NULL 
      ORDER BY admin1 ASC
    `;
        const admin1Result = await query<{ admin1: string }>(admin1Query);
        const admin1 = admin1Result.rows.map((r) => r.admin1);

        // Fetch event types and their sub types
        const eventTypesQuery = `
      SELECT event_type, sub_event_type
      FROM acled_event_types
      ORDER BY event_type, sub_event_type
    `;
        const eventTypesResult = await query<{ event_type: string; sub_event_type: string | null }>(eventTypesQuery);

        // Group sub types by event type
        const eventTypeMap = new Map<string, Set<string>>();
        eventTypesResult.rows.forEach((row) => {
            if (!eventTypeMap.has(row.event_type)) {
                eventTypeMap.set(row.event_type, new Set());
            }
            if (row.sub_event_type) {
                eventTypeMap.get(row.event_type)?.add(row.sub_event_type);
            }
        });

        const eventTypes = Array.from(eventTypeMap.entries()).map(([type, subTypes]) => ({
            type,
            subTypes: Array.from(subTypes).sort(),
        }));

        return { admin1, eventTypes };
    } catch (error) {
        console.error("Error fetching filter options:", error);
        return { admin1: [], eventTypes: [] };
    }
}

/**
 * Fetch aggregated trends based on filters
 */
export async function getAggregatedTrends(
    filters: {
        admin1?: string;
        eventType?: string;
        subEventType?: string;
        startDate?: string;
        endDate?: string;
    }
): Promise<AggregatedChartData[]> {
    try {
        const conditions: string[] = [];
        const params: (string | number)[] = [];
        let paramIndex = 1;

        if (filters.admin1) {
            conditions.push(`admin1 = $${paramIndex++}`);
            params.push(filters.admin1);
        }
        if (filters.eventType) {
            conditions.push(`event_type = $${paramIndex++}`);
            params.push(filters.eventType);
        }
        if (filters.subEventType) {
            conditions.push(`sub_event_type = $${paramIndex++}`);
            params.push(filters.subEventType);
        }

        // Default date range: 2021 to current year if no dates provided
        const currentYear = new Date().getFullYear();
        const startDate = filters.startDate || '2021-01-01';
        const endDate = filters.endDate || `${currentYear}-12-31`;

        conditions.push(`week >= $${paramIndex++}`);
        params.push(startDate);
        conditions.push(`week <= $${paramIndex++}`);
        params.push(endDate);

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        // Aggregate by MONTH
        // Note: We use string casting for sums to match the library behavior we fixed earlier
        const sql = `
      SELECT 
        DATE_TRUNC('month', week) as month_date,
        SUM(events) as events,
        SUM(fatalities) as fatalities
      FROM acled_aggregated
      ${whereClause}
      GROUP BY month_date
      ORDER BY month_date ASC
    `;

        interface QueryResult {
            month_date: Date;
            events: string | number;
            fatalities: string | number;
        }

        const result = await query<QueryResult>(sql, params);

        return result.rows.map((row) => ({
            date: new Date(row.month_date).toISOString().slice(0, 7), // YYYY-MM
            events: Number(row.events),
            fatalities: Number(row.fatalities),
        }));
    } catch (error) {
        console.error("Error fetching aggregated trends:", error);
        return [];
    }
}
