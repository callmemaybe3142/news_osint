# Search Ministry Page Implementation

## Overview
Implemented a comprehensive search page for finding people by ministry and department affiliation with pagination and detailed person information modals.

## Features Implemented

### 1. Backend API Endpoints

#### `/person/search` (GET)
- Search for people by ministry and/or department
- Pagination support (offset/limit)
- Returns person details with highest-ranked position and punishments
- Sorted by position rank (ascending) and name

**Query Parameters:**
- `ministry_name` (optional): Filter by ministry
- `department_id` (optional): Filter by department
- `offset` (default: 0): Pagination offset
- `limit` (default: 30, max: 100): Results per page

**Response:**
```json
{
  "people": [...],
  "total": 150,
  "offset": 0,
  "limit": 30,
  "has_more": true
}
```

#### `/person/{person_id}/details` (GET)
- Get complete details for a specific person
- Includes all related data: positions, punishments, addresses, educations, countries, trainings

### 2. Frontend Components

#### `MinistryDepartmentFilter.tsx`
- Two typeahead dropdowns (ministry and department)
- Department dropdown is dependent on selected ministry
- Dropdown filtering with search
- Clear buttons for each field
- Disabled state for department when no ministry selected

#### `PersonSummaryCard.tsx`
- Displays key person information in a card layout
- Shows position with rank badge
- Displays NRC, blood group, religion, race
- Shows department and ministry with icons
- Punishment count badge (if any)
- SAC member badge (if applicable)
- Hover effects for better UX
- Click to open details modal

#### `PersonDetailsModal.tsx`
- Full-screen modal with all person information
- Organized into sections:
  - Basic Information
  - Family Information
  - Important Dates
  - Ministry & Department
  - Positions (sorted by rank)
  - Punishments (highlighted in red)
  - Addresses (with permanent flag)
  - Education
  - Countries
  - Trainings (with international flag)
- Copy-to-clipboard button for each field
- Visual feedback when copied (checkmark icon)
- Responsive design

### 3. Data Management

#### `ministryStorage.ts` Utility
- Manages sessionStorage for ministry structure data
- 30-minute cache duration
- Automatic expiration checking
- Error handling for storage operations

**Why sessionStorage?**
- Data only needed during current browsing session
- Automatically cleared when tab/browser closes
- More privacy-friendly for sensitive personnel data
- Prevents stale data issues
- Better performance (no repeated API calls)

#### `person.ts` Types
- Complete TypeScript type definitions
- `Person`: Basic person info with position and punishments
- `PersonDetails`: Extended person info with all related data
- `SearchResponse`: API response structure
- `Ministry`, `Department`: Structure data types

### 4. Search Ministry Page

#### Features:
- **Filter Section**: Ministry and department typeahead dropdowns
- **Search Button**: Disabled until ministry selected
- **Results Grid**: Responsive 3-column layout (1 on mobile, 2 on tablet)
- **Pagination**: "Load More" button (fetches 30 at a time)
- **Result Count**: Shows "X of Y" results
- **Empty States**: Different messages for no results vs. no search
- **Loading States**: Spinner for initial load and load more
- **Error Handling**: User-friendly error messages

#### User Flow:
1. Page loads → Checks sessionStorage for ministry data
2. If not cached → Fetches from API and caches
3. User selects ministry → Department dropdown enables
4. User optionally selects department
5. User clicks "Search People" → Fetches first 30 results
6. User clicks card → Opens modal with full details
7. User can copy any field to clipboard
8. User clicks "Load More" → Fetches next 30 results

### 5. Performance Optimizations

1. **SessionStorage Caching**: Ministry structure cached for 30 minutes
2. **Pagination**: Only loads 30 results at a time
3. **Lazy Loading**: Person details only fetched when modal opens
4. **Memoization**: Filter dropdowns use useMemo for filtering
5. **Optimized Queries**: Database queries use indexes and proper joins

## Database Considerations

### Queries Handle:
- Not all people have positions (LEFT JOIN used)
- Not all people have punishments (returns empty array)
- Not all people have addresses, educations, countries, or trainings
- Proper NULL handling in all queries

### Sorting:
- Primary: Position rank (ascending, NULLs last)
- Secondary: Person name (ascending)

## File Structure

```
backend/
└── routes/
    └── person/
        ├── __init__.py          # Router aggregation
        ├── ministry.py          # Ministry structure endpoint
        ├── search.py            # NEW: Search endpoints
        └── README.md

frontend/
└── src/
    ├── components/
    │   └── person/              # NEW: Person components
    │       ├── MinistryDepartmentFilter.tsx
    │       ├── PersonSummaryCard.tsx
    │       └── PersonDetailsModal.tsx
    ├── pages/
    │   ├── MinistryStructurePage.tsx  # UPDATED: Added caching
    │   └── SearchMinistryPage.tsx     # UPDATED: Full implementation
    ├── types/
    │   └── person.ts            # NEW: Type definitions
    └── utils/
        └── ministryStorage.ts   # NEW: Storage utility
```

## API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/person/ministry-structure` | GET | Get hierarchical ministry/department structure |
| `/person/search` | GET | Search people by ministry/department with pagination |
| `/person/{person_id}/details` | GET | Get complete details for a person |

## Next Steps (Optional Enhancements)

1. Add export to CSV/Excel functionality
2. Add advanced filters (by position, punishment, SAC status, etc.)
3. Add sorting options (by name, rank, date, etc.)
4. Add bulk operations (select multiple people)
5. Add person comparison feature
6. Add search history
7. Add bookmarking/favorites for people
