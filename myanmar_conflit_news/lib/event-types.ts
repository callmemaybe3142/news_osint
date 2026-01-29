// Event Data Types for ACLED Events

export interface EventActor {
    actor_id: number;
    actor_name: string;
    actor_role: number; // 1=actor1, 2=actor2
    is_associated: boolean;
}

export interface EventSource {
    source_id: number;
    source_name: string;
}

export interface EventData {
    event_id: number;
    event_id_cnty: string;
    event_date: string;
    event_type: string;
    sub_event_type: string;
    interaction_code: string;
    interaction_title?: string; // From join with acled_interactions
    civilian_targeting: boolean;
    admin1: string;
    admin2: string;
    admin3: string;
    location: string;
    latitude: number;
    longitude: number;
    notes: string;
    fatalities: number;
    population_best: number;
    tags: string;
    actors: EventActor[];
    sources: EventSource[];
}

export interface EventFilters {
    startDate?: string;
    endDate?: string;
    actorId?: number;
    interactionCode?: string;
    admin1?: string;
    admin2?: string;
    admin3?: string;
    eventType?: string;
    subEventType?: string;
    searchText?: string;
    searchOperator?: 'and' | 'or';
    page?: number;
    limit?: number;
}

export interface EventFilterOptions {
    actors: Array<{ actor_id: number; actor_name: string }>;
    interactions: Array<{ code: number; title: string }>;
    locations: Array<{
        admin1: string;
        admin2: string;
        admin3: string;
    }>;
    eventTypes: Array<{
        event_type: string;
        sub_event_type: string;
    }>;
}

export interface PaginatedEvents {
    events: EventData[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
