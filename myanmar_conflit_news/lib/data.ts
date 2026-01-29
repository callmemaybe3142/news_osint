import { query } from "./db";
import {
  StatisticsSummary,
  WeeklyTrend,
  RegionStats,
  EventTypeStats,
  TotalsQueryResult,
  RegionQueryResult,
  EventTypeQueryResult,
  WeekQueryResult,
} from "./types";

/**
 * Get overall statistics summary from aggregated data
 */
export async function getStatisticsSummary(): Promise<StatisticsSummary> {
  try {
    // Get total events and fatalities
    const totalQuery = `
      SELECT 
        COALESCE(SUM(events), 0) as total_events,
        COALESCE(SUM(fatalities), 0) as total_fatalities,
        COALESCE(SUM(population_exposure), 0) as total_population_exposed
      FROM acled_aggregated
    `;
    const result = await query<TotalsQueryResult>(totalQuery);
    const [totals] = result.rows;

    // Get most affected region
    const regionQuery = `
      SELECT 
        admin1,
        SUM(events) as events
      FROM acled_aggregated
      WHERE admin1 IS NOT NULL
      GROUP BY admin1
      ORDER BY events DESC
      LIMIT 1
    `;
    const regionResult = await query<RegionQueryResult>(regionQuery);
    const [mostAffectedRegion] = regionResult.rows;

    // Get most common event type
    const eventTypeQuery = `
      SELECT 
        event_type,
        SUM(events) as count
      FROM acled_aggregated
      WHERE event_type IS NOT NULL
      GROUP BY event_type
      ORDER BY count DESC
      LIMIT 1
    `;
    const eventTypeResult = await query<EventTypeQueryResult>(eventTypeQuery);
    const [mostCommonEventType] = eventTypeResult.rows;

    // Get most recent week data
    const recentWeekQuery = `
      SELECT 
        week,
        SUM(events) as events,
        SUM(fatalities) as fatalities
      FROM acled_aggregated
      GROUP BY week
      ORDER BY week DESC
      LIMIT 1
    `;
    const weekResult = await query<WeekQueryResult>(recentWeekQuery);
    const [recentWeek] = weekResult.rows;

    return {
      totalEvents: Number(totals?.total_events ?? 0),
      totalFatalities: Number(totals?.total_fatalities ?? 0),
      totalPopulationExposed: Number(totals?.total_population_exposed ?? 0),
      mostAffectedRegion: {
        name: mostAffectedRegion?.admin1 ?? "N/A",
        events: Number(mostAffectedRegion?.events ?? 0),
      },
      mostCommonEventType: {
        type: mostCommonEventType?.event_type ?? "N/A",
        count: Number(mostCommonEventType?.count ?? 0),
      },
      recentWeekData: {
        week: recentWeek?.week ?? new Date().toISOString(),
        events: Number(recentWeek?.events ?? 0),
        fatalities: Number(recentWeek?.fatalities ?? 0),
      },
    };
  } catch (error) {
    console.error("Error fetching statistics summary:", error);
    // Return default values on error
    return {
      totalEvents: 0,
      totalFatalities: 0,
      totalPopulationExposed: 0,
      mostAffectedRegion: { name: "N/A", events: 0 },
      mostCommonEventType: { type: "N/A", count: 0 },
      recentWeekData: {
        week: new Date().toISOString(),
        events: 0,
        fatalities: 0,
      },
    };
  }
}

/**
 * Get weekly trends (last 12 weeks)
 */
export async function getWeeklyTrends(limit: number = 12): Promise<WeeklyTrend[]> {
  try {
    const trendsQuery = `
      SELECT 
        week,
        SUM(events) as events,
        SUM(fatalities) as fatalities
      FROM acled_aggregated
      GROUP BY week
      ORDER BY week DESC
      LIMIT $1
    `;
    const trendsResult = await query<WeekQueryResult>(trendsQuery, [limit]);
    return trendsResult.rows
      .map((item) => ({
        week: item.week,
        events: Number(item.events),
        fatalities: Number(item.fatalities),
      }))
      .reverse(); // Reverse to show oldest to newest
  } catch (error) {
    console.error("Error fetching weekly trends:", error);
    return [];
  }
}

/**
 * Get top regions by event count
 */
export async function getTopRegions(limit: number = 10): Promise<RegionStats[]> {
  try {
    const regionsQuery = `
      SELECT 
        admin1,
        SUM(events) as events,
        SUM(fatalities) as fatalities,
        SUM(population_exposure) as population_exposure
      FROM acled_aggregated
      WHERE admin1 IS NOT NULL
      GROUP BY admin1
      ORDER BY events DESC
      LIMIT $1
    `;
    interface FullRegionQueryResult {
      admin1: string;
      events: string | number;
      fatalities: string | number;
      population_exposure: string | number;
    }
    const results = await query<FullRegionQueryResult>(regionsQuery, [limit]);
    return results.rows.map((item) => ({
      admin1: item.admin1,
      events: Number(item.events),
      fatalities: Number(item.fatalities),
      population_exposure: Number(item.population_exposure),
    }));
  } catch (error) {
    console.error("Error fetching top regions:", error);
    return [];
  }
}

/**
 * Get event type distribution
 */
export async function getEventTypeDistribution(
  limit: number = 10
): Promise<EventTypeStats[]> {
  try {
    const eventTypesQuery = `
      SELECT 
        event_type,
        SUM(events) as events,
        SUM(fatalities) as fatalities
      FROM acled_aggregated
      WHERE event_type IS NOT NULL
      GROUP BY event_type
      ORDER BY events DESC
      LIMIT $1
    `;
    interface FullEventTypeQueryResult {
      event_type: string;
      events: string | number;
      fatalities: string | number;
    }
    const results = await query<FullEventTypeQueryResult>(eventTypesQuery, [limit]);
    return results.rows.map((item) => ({
      event_type: item.event_type,
      events: Number(item.events),
      fatalities: Number(item.fatalities),
    }));
  } catch (error) {
    console.error("Error fetching event type distribution:", error);
    return [];
  }
}
