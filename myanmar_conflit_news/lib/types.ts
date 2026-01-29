/**
 * Type definitions for ACLED data
 */

export interface AggregatedData {
    aggregated_id: number;
    week: string;
    admin1: string | null;
    event_type: string | null;
    sub_event_type: string | null;
    events: number;
    fatalities: number;
    population_exposure: number;
    disorder_type: string | null;
    created_at: string;
    updated_at: string;
}

export interface EventType {
    event_type_id: number;
    event_type: string;
    sub_event_type: string | null;
    created_at: string;
}

export interface Location {
    location_id: number;
    admin1: string | null;
    admin2: string | null;
    admin3: string | null;
    created_at: string;
}

export interface Interaction {
    code: number;
    title: string;
    description: string;
    created_at: string;
}

export interface StatisticsSummary {
    totalEvents: number;
    totalFatalities: number;
    totalPopulationExposed: number;
    mostAffectedRegion: {
        name: string;
        events: number;
    };
    mostCommonEventType: {
        type: string;
        count: number;
    };
    recentWeekData: {
        week: string;
        events: number;
        fatalities: number;
    };
}

export interface WeeklyTrend {
    week: string;
    events: number;
    fatalities: number;
}

export interface RegionStats {
    admin1: string;
    events: number;
    fatalities: number;
    population_exposure: number;
}

export interface EventTypeStats {
    event_type: string;
    events: number;
    fatalities: number;
}

// Database query result types
export interface TotalsQueryResult {
    total_events: string | number;
    total_fatalities: string | number;
    total_population_exposed: string | number;
}

export interface RegionQueryResult {
    admin1: string;
    events: string | number;
}

export interface EventTypeQueryResult {
    event_type: string;
    count: string | number;
}

export interface WeekQueryResult {
    week: string;
    events: string | number;
    fatalities: string | number;
}

export interface FilterOptions {
    admin1: string[];
    eventTypes: {
        type: string;
        subTypes: string[];
    }[];
}

export interface AggregatedChartData {
    date: string;
    events: number;
    fatalities: number;
}