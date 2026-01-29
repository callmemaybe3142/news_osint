# Event Data Page Implementation Plan

## Overview
Implement a comprehensive Event Data page for displaying ACLED event data with advanced filtering and pagination.

## Components to Create

### 1. API Routes ✅
- [x] `/api/events/options/route.ts` - Fetch filter options
- [ ] `/api/events/route.ts` - Fetch paginated events with filters

### 2. Services
- [ ] `lib/event-service.ts` - Server-side data fetching logic

### 3. Components
- [ ] `components/events/EventCard.tsx` - Display individual event
- [ ] `components/events/EventFilterPanel.tsx` - Desktop filter panel
- [ ] `components/events/EventFilterModal.tsx` - Mobile filter modal
- [ ] `components/events/EventList.tsx` - List of events with pagination
- [ ] `components/events/TypeaheadSelect.tsx` - Reusable typeahead dropdown
- [ ] `components/events/LocationFilter.tsx` - Hierarchical location filter

### 4. Main Page
- [ ] `app/event-data/page.tsx` - Main event data page

## Features

### Data Display (EventCard)
- Event notes (news content)
- Fatalities count
- Population affected (population_best)
- Interaction code with title
- Civilian targeting indicator
- Event type and sub-event type
- Location (admin1, admin2, admin3)
- Coordinates (latitude, longitude)
- Tags
- Event sources
- Actors (Actor1 VS Actor2 format, with associated actors)

### Filters
1. **Date Range** - Start and end date picker
2. **Actors** - Typeahead dropdown
3. **Interactions** - Typeahead dropdown (show code + title)
4. **Locations** - Hierarchical typeahead (admin1 → admin2 → admin3, bidirectional)
5. **Event Types** - Dependent dropdowns (event_type → sub_event_type)
6. **Text Search** - Notes field with AND/OR operators for multiple keywords

### Pagination
- Default: 50 events per page
- Load more / page navigation
- Total count display

### Responsive Design
- Desktop: Filter panel on left side
- Mobile: Filter button opens full-screen modal

## Implementation Steps

1. ✅ Create types (`lib/event-types.ts`)
2. ✅ Create filter options API (`/api/events/options/route.ts`)
3. Create events API with filtering (`/api/events/route.ts`)
4. Create event service (`lib/event-service.ts`)
5. Create TypeaheadSelect component
6. Create LocationFilter component
7. Create EventFilterPanel component
8. Create EventFilterModal component
9. Create EventCard component
10. Create EventList component
11. Create main page (`app/event-data/page.tsx`)

## Technical Notes

- Use session storage for filter options (prevent refetching)
- Default sort: event_date DESC
- Default limit: 50 events
- Full-text search on notes field using PostgreSQL's `to_tsvector`
- Hierarchical location filtering with auto-fill
- Actor display format: "Actor1 VS Actor2" with associated actors noted

## Database Queries

### Main Events Query
```sql
SELECT 
  e.event_id, e.event_id_cnty, e.event_date,
  e.event_type, e.sub_event_type, e.interaction_code,
  i.title as interaction_title,
  e.civilian_targeting, e.admin1, e.admin2, e.admin3,
  e.location, e.latitude, e.longitude,
  e.notes, e.fatalities, e.population_best, e.tags
FROM acled_events e
LEFT JOIN acled_interactions i ON e.interaction_code::integer = i.code
WHERE [filters]
ORDER BY e.event_date DESC
LIMIT 50 OFFSET [page * limit]
```

### Actors Query (per event)
```sql
SELECT a.actor_id, a.actor_name, ea.actor_role, ea.is_associated
FROM acled_event_actors ea
JOIN acled_actors a ON ea.actor_id = a.actor_id
WHERE ea.event_id = $1
ORDER BY ea.actor_role, ea.is_associated
```

### Sources Query (per event)
```sql
SELECT s.source_id, s.source_name
FROM acled_event_sources es
JOIN acled_sources s ON es.source_id = s.source_id
WHERE es.event_id = $1
```
