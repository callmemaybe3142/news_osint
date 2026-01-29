# ACLED Interactions Table - Documentation

## Overview

The `acled_interactions` table stores all ACLED interaction codes that describe the type of interaction between actors in conflict events. The interaction code is a **two-digit number** where:
- **First digit** = Actor 1 type (inter1)
- **Second digit** = Actor 2 type (inter2)

## Table Structure

```sql
CREATE TABLE acled_interactions (
    code SMALLINT PRIMARY KEY CHECK (code >= 10 AND code <= 88),
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Actor Type Codes

| Code | Actor Type |
|------|------------|
| **0** | No actor 2 / No interaction |
| **1** | State Forces |
| **2** | Rebel Groups |
| **3** | Political Militias |
| **4** | Identity Militias |
| **5** | Rioters |
| **6** | Protesters |
| **7** | Civilians |
| **8** | External/Other Forces |

## Interaction Codes

### State Forces (1X)
| Code | Title | Description |
|------|-------|-------------|
| **10** | State forces only | Sole state forces action (base establishment, remote violence, non-violent operations) |
| **11** | State forces-State forces | Military infighting, mutinies, arrests of military officials |
| **12** | State forces-Rebel group | Civil war violence between state forces and rebels |
| **13** | State forces-Political militia | Violence with unidentified armed groups, political party militias |
| **14** | State forces-Identity militia | Military engagement with communal militias |
| **15** | State forces-Rioters | Suppression of violent demonstrations |
| **16** | State forces-Protesters | Suppression of peaceful demonstrations |
| **17** | State forces-Civilians | State repression, arrests by police |
| **18** | State forces-External/Other | Inter-state conflict, engagement with UN/private security |

### Rebel Groups (2X)
| Code | Title | Description |
|------|-------|-------------|
| **20** | Rebel group only | Sole rebel action (base establishment, remote violence) |
| **22** | Rebel group-Rebel group | Rebel infighting, violence between rebel groups |
| **23** | Rebel group-Political militia | Civil war violence with pro-government militias |
| **24** | Rebel group-Identity militia | Violence with local security providers |
| **25** | Rebel group-Rioters | Spontaneous violence against rebels |
| **26** | Rebel group-Protesters | Violence against protesters by rebels |
| **27** | Rebel group-Civilians | Rebel targeting of civilians |
| **28** | Rebel group-External/Other | Violence with allied state military, UN operations |

### Political Militias (3X)
| Code | Title | Description |
|------|-------|-------------|
| **30** | Political militia only | Sole political militia action (remote violence, strategic arson) |
| **33** | Political militia-Political militia | Inter-elite violence |
| **34** | Political militia-Identity militia | Violence with communal militias |
| **35** | Political militia-Rioters | Violent demonstrations against political militias |
| **36** | Political militia-Protesters | Suppression of peaceful demonstrations |
| **37** | Political militia-Civilians | Outsourced state repression, civilian targeting |
| **38** | Political militia-External/Other | Violence with private security, external forces |

### Identity Militias (4X)
| Code | Title | Description |
|------|-------|-------------|
| **40** | Identity militia only | Sole identity militia action (property destruction, militia establishment) |
| **44** | Identity militia-Identity militia | Inter-communal violence |
| **45** | Identity militia-Rioters | Violent demonstrations against identity militias |
| **46** | Identity militia-Protesters | Suppression of peaceful demonstrations |
| **47** | Identity militia-Civilians | Civilian targeting in inter-communal violence |
| **48** | Identity militia-External/Other | External military engaging communal militias |

### Rioters (5X)
| Code | Title | Description |
|------|-------|-------------|
| **50** | Rioters only | One-sided violent demonstration, spontaneous arson |
| **55** | Rioters-Rioters | Two-sided violent demonstration |
| **56** | Rioters-Protesters | Two-sided demonstration (only one side violent) |
| **57** | Rioters-Civilians | Violent demonstration targeting civilians, mob violence |
| **58** | Rioters-External/Other | Mob violence against regional/international operations |

### Protesters (6X)
| Code | Title | Description |
|------|-------|-------------|
| **60** | Protesters only | One-sided peaceful protest |
| **66** | Protesters-Protesters | Two-sided peaceful protest |
| **67** | Protesters-Civilians | Peaceful protesters engaging civilians |
| **68** | Protesters-External/Other | Suppression by private security forces |

### Civilians (7X)
| Code | Title | Description |
|------|-------|-------------|
| **70** | Civilians only | One-sided strategic development |
| **77** | Civilians-Civilians | Peaceful interactions between civilians |
| **78** | External/Other-Civilians | Regional/international operations targeting civilians |

### External/Other Forces (8X)
| Code | Title | Description |
|------|-------|-------------|
| **80** | External/Other forces only | Strategic developments, remote violence, non-violent operations |
| **88** | External/Other-External/Other | Clashes between foreign forces, international missions |

---

## Usage Examples

### Query events with interaction descriptions

```sql
SELECT 
    e.event_date,
    e.event_type,
    e.admin1,
    e.interaction_code,
    i.title as interaction_type,
    i.description,
    e.fatalities
FROM acled_events e
LEFT JOIN acled_interactions i ON e.interaction_code::INTEGER = i.code
ORDER BY e.event_date DESC
LIMIT 100;
```

### Count events by interaction type

```sql
SELECT 
    i.code,
    i.title,
    COUNT(e.event_id) as event_count,
    SUM(e.fatalities) as total_fatalities
FROM acled_interactions i
LEFT JOIN acled_events e ON e.interaction_code::INTEGER = i.code
GROUP BY i.code, i.title
ORDER BY event_count DESC;
```

### Find all State Forces vs Civilians events

```sql
SELECT 
    e.event_date,
    e.admin1,
    e.admin2,
    e.notes,
    e.fatalities
FROM acled_events e
WHERE e.interaction_code = '17'
ORDER BY e.event_date DESC;
```

### Analyze interaction patterns by region

```sql
SELECT 
    e.admin1 as region,
    i.title as interaction_type,
    COUNT(*) as event_count
FROM acled_events e
JOIN acled_interactions i ON e.interaction_code::INTEGER = i.code
GROUP BY e.admin1, i.code, i.title
ORDER BY e.admin1, event_count DESC;
```

### Monthly trend of specific interaction types

```sql
SELECT 
    DATE_TRUNC('month', e.event_date)::DATE as month,
    i.title,
    COUNT(*) as events,
    SUM(e.fatalities) as fatalities
FROM acled_events e
JOIN acled_interactions i ON e.interaction_code::INTEGER = i.code
WHERE i.code IN (12, 17, 27)  -- State vs Rebels, State vs Civilians, Rebels vs Civilians
GROUP BY month, i.code, i.title
ORDER BY month DESC, events DESC;
```

### Find most violent interaction types

```sql
SELECT 
    i.title,
    COUNT(e.event_id) as total_events,
    SUM(e.fatalities) as total_deaths,
    AVG(e.fatalities) as avg_deaths_per_event
FROM acled_interactions i
LEFT JOIN acled_events e ON e.interaction_code::INTEGER = i.code
GROUP BY i.code, i.title
HAVING COUNT(e.event_id) > 0
ORDER BY total_deaths DESC
LIMIT 20;
```

---

## Files Created

1. **`sql/create_acled_interactions.sql`** - Standalone SQL file to create the table
2. **`sql/schema_acled.sql`** - Updated main schema with interactions table
3. **`INTERACTIONS_REFERENCE.md`** - This documentation file

---

## Notes

- The interaction code is stored as VARCHAR in `acled_events.interaction_code` but as SMALLINT in `acled_interactions.code`
- When joining, cast the VARCHAR to INTEGER: `e.interaction_code::INTEGER = i.code`
- Total of **44 unique interaction codes** in the ACLED system
- Codes follow a pattern: first digit = actor1 type, second digit = actor2 type
- Code X0 means "only actor X" (no second actor)
- Codes are not continuous (e.g., no code 19, 21, 31, etc.)

---

## Integration with Other Tables

The interactions table works together with:
- **`acled_events`** - Links via `interaction_code` column
- **`acled_actor_codes`** - Provides actor type descriptions (codes 0-8)
- **`acled_actors`** - Stores individual actor names with their type codes

### Complete event analysis query:

```sql
SELECT 
    e.event_date,
    e.event_type,
    e.admin1,
    a1.actor_name as actor1,
    ac1.description as actor1_type,
    a2.actor_name as actor2,
    ac2.description as actor2_type,
    i.title as interaction,
    e.fatalities
FROM acled_events e
LEFT JOIN acled_event_actors ea1 ON e.event_id = ea1.event_id AND ea1.actor_role = 1
LEFT JOIN acled_actors a1 ON ea1.actor_id = a1.actor_id
LEFT JOIN acled_actor_codes ac1 ON a1.actor_code = ac1.code
LEFT JOIN acled_event_actors ea2 ON e.event_id = ea2.event_id AND ea2.actor_role = 2
LEFT JOIN acled_actors a2 ON ea2.actor_id = a2.actor_id
LEFT JOIN acled_actor_codes ac2 ON a2.actor_code = ac2.code
LEFT JOIN acled_interactions i ON e.interaction_code::INTEGER = i.code
ORDER BY e.event_date DESC
LIMIT 100;
```
