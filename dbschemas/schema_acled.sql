-- ACLED Myanmar Event Data Schema
-- Database schema for storing and analyzing ACLED conflict event data

-- ============================================================================
-- MAIN EVENTS TABLE
-- ============================================================================

CREATE TABLE acled_events (
    event_id SERIAL PRIMARY KEY,
    event_id_cnty VARCHAR(20) UNIQUE NOT NULL,  -- Original ACLED ID (e.g., MMR1, MMR2)
    event_date DATE NOT NULL,
    time_precision SMALLINT CHECK (time_precision IN (1, 2, 3)),
    
    -- Event Classification
    disorder_type VARCHAR(50),
    event_type VARCHAR(100),
    sub_event_type VARCHAR(100),
    civilian_targeting BOOLEAN,
    interaction_code VARCHAR(10),  -- e.g., '10', '41', etc.
    
    -- Location Data (denormalized for query performance)
    admin1 VARCHAR(100),  -- State/Region
    admin2 VARCHAR(100),  -- District
    admin3 VARCHAR(100),  -- Township
    location VARCHAR(200),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(11, 7),
    geo_precision SMALLINT,
    
    -- Event Details
    notes TEXT,  -- News text content
    fatalities INTEGER DEFAULT 0 CHECK (fatalities >= 0),
    tags TEXT,
    
    -- Population Data
    population_1km INTEGER,
    population_2km INTEGER,
    population_5km INTEGER,
    population_best INTEGER,
    
    -- Metadata
    source_scale VARCHAR(50),
    timestamp BIGINT,
    
    -- System fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add comment
COMMENT ON TABLE acled_events IS 'Main table storing ACLED conflict event data for Myanmar';
COMMENT ON COLUMN acled_events.event_id_cnty IS 'Original ACLED event ID (unique identifier from source)';
COMMENT ON COLUMN acled_events.time_precision IS '1=exact date, 2=approximate date, 3=date range';
COMMENT ON COLUMN acled_events.civilian_targeting IS 'TRUE if event involved civilian targeting';
COMMENT ON COLUMN acled_events.notes IS 'News text content describing the event';

-- ============================================================================
-- ACTORS TABLES (Normalized)
-- ============================================================================

CREATE TABLE acled_actors (
    actor_id SERIAL PRIMARY KEY,
    actor_name VARCHAR(255) UNIQUE NOT NULL,
    actor_code SMALLINT CHECK (actor_code >= 0 AND actor_code <= 8),  -- ACLED inter1/inter2 codes
    actor_type VARCHAR(100),  -- Can be categorized later
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE acled_actors IS 'Master list of all actors involved in events';
COMMENT ON COLUMN acled_actors.actor_code IS 'ACLED interaction code: 0=No interaction, 1=State Forces, 2=Rebel Groups, 3=Political Militias, 4=Identity Militias, 5=Rioters, 6=Protesters, 7=Civilians, 8=External/Other Forces';

-- Event-Actor Relationship (Many-to-Many)
CREATE TABLE acled_event_actors (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES acled_events(event_id) ON DELETE CASCADE,
    actor_id INTEGER NOT NULL REFERENCES acled_actors(actor_id) ON DELETE CASCADE,
    actor_role SMALLINT NOT NULL CHECK (actor_role IN (1, 2)),  -- 1=actor1, 2=actor2
    is_associated BOOLEAN DEFAULT FALSE,  -- TRUE if from assoc_actor_1 or assoc_actor_2
    
    UNIQUE(event_id, actor_id, actor_role, is_associated)
);

COMMENT ON TABLE acled_event_actors IS 'Links events to actors (supports multiple actors per event)';
COMMENT ON COLUMN acled_event_actors.actor_role IS '1=primary actor1, 2=primary actor2';
COMMENT ON COLUMN acled_event_actors.is_associated IS 'TRUE for associated actors (assoc_actor_1/2)';

-- ============================================================================
-- ACTOR CODE REFERENCE TABLE
-- ============================================================================

CREATE TABLE acled_actor_codes (
    code SMALLINT PRIMARY KEY CHECK (code >= 0 AND code <= 8),
    description VARCHAR(100) NOT NULL,
    notes TEXT
);

-- Insert the ACLED actor code definitions
INSERT INTO acled_actor_codes (code, description, notes) VALUES
    (0, 'No Actor 2 / No Interaction', 'Used when there is no second actor or no interaction'),
    (1, 'State Forces', 'Government military, police, and security forces'),
    (2, 'Rebel Groups', 'Armed opposition groups and insurgents'),
    (3, 'Political Militias', 'Armed groups affiliated with political parties'),
    (4, 'Identity Militias', 'Ethnic, religious, or communal militias'),
    (5, 'Rioters', 'Violent mob or crowd actions'),
    (6, 'Protesters', 'Non-violent demonstrators and protesters'),
    (7, 'Civilians', 'Unarmed civilian population'),
    (8, 'External/Other Forces', 'Foreign military, private security, international organizations');

COMMENT ON TABLE acled_actor_codes IS 'Reference table for ACLED actor/interaction codes';

-- ============================================================================
-- INTERACTION CODES TABLE
-- ============================================================================

CREATE TABLE acled_interactions (
    code SMALLINT PRIMARY KEY CHECK (code >= 10 AND code <= 88),
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert all ACLED interaction codes
INSERT INTO acled_interactions (code, title, description) VALUES
    (10, 'State forces only', 'SOLE STATE FORCES ACTION (e.g., base establishment by state forces; remote violence involving state military with no reported casualties; non-violent military operations)'),
    (11, 'State forces-State forces', 'STATE FORCES VERSUS STATE FORCES (e.g., military infighting; battles between a military and mutinous forces; arrests of military officials)'),
    (12, 'State forces-Rebel group', 'STATE FORCES VERSUS REBELS (e.g., civil war violence between state forces and a rebel actor)'),
    (13, 'State forces-Political militia', 'STATE FORCES VERSUS POLITICAL MILITIA (e.g., violence between state forces and unidentified armed groups; violence between police and political party militias)'),
    (14, 'State forces-Identity militia', 'STATE FORCES VERSUS IDENTITY MILITIA (e.g., military engagement with a communal militia)'),
    (15, 'State forces-Rioters', 'STATE FORCES VERSUS RIOTERS (e.g., suppression of a violent demonstration by police or military)'),
    (16, 'State forces-Protesters', 'STATE FORCES VERSUS PROTESTERS (e.g., suppression of a peaceful demonstration by police or military)'),
    (17, 'State forces-Civilians', 'STATE FORCES VERSUS CIVILIANS (e.g., state repression of civilians; arrests by police)'),
    (18, 'State forces-External/Other forces', 'STATE FORCES VERSUS EXTERNAL/OTHER FORCES (e.g., inter-state conflict; state engagement with private security forces or a UN operation; strategic developments between a regime and the UN or another external actor)'),
    (20, 'Rebel group only', 'SOLE REBEL ACTION (e.g., base establishment; remote violence involving rebel groups with no reported target; accidental detonation by a rebel group)'),
    (22, 'Rebel group-Rebel group', 'REBELS VERSUS REBELS (e.g., rebel infighting; violence between rebel groups and their splinter movements)'),
    (23, 'Rebel group-Political militia', 'REBELS VERSUS POLITICAL MILITIA (e.g., civil war violence between rebels and a pro-government militia; violence between rebels and unidentified armed groups)'),
    (24, 'Rebel group-Identity militia', 'REBELS VERSUS IDENTITY MILITIA (e.g., violence between rebels and local security providers)'),
    (25, 'Rebel group-Rioters', 'REBELS VERSUS RIOTERS (e.g., spontaneous violence against a rebel group; a violent demonstration engaging a rebel group)'),
    (26, 'Rebel group-Protesters', 'REBELS VERSUS PROTESTERS (e.g., violence against protesters by rebels)'),
    (27, 'Rebel group-Civilians', 'REBELS VERSUS CIVILIANS (e.g., rebel targeting of civilians [a strategy commonly used in civil war])'),
    (28, 'Rebel group-External/Other forces', 'REBELS VERSUS OTHERS (e.g., civil war violence between rebels and an allied state military; rebel violence against a UN operation)'),
    (30, 'Political militia only', 'SOLE POLITICAL MILITIA ACTION (e.g., remote violence by an unidentified armed group with no reported target; accidental detonation by a political militia; strategic arson as intimidation by a political party)'),
    (33, 'Political militia-Political militia', 'POLITICAL MILITIA VERSUS POLITICAL MILITIA (e.g., inter-elite violence)'),
    (34, 'Political militia-Identity militia', 'POLITICAL MILITIA VERSUS IDENTITY MILITIA (e.g., violence between communal militia and an unidentified armed group; violence between political militia and local security providers)'),
    (35, 'Political militia-Rioters', 'POLITICAL MILITIA VERSUS RIOTERS (e.g., violent demonstration against a political militia; spontaneous violence against a political militia)'),
    (36, 'Political militia-Protesters', 'POLITICAL MILITIA VERSUS PROTESTERS (e.g., suppression of a peaceful demonstration by a political militia)'),
    (37, 'Political militia-Civilians', 'POLITICAL MILITIA VERSUS CIVILIANS (e.g., out-sourced state repression carried out by pro-government militias; civilian targeting by political militias or unidentified armed groups)'),
    (38, 'Political militia-External/Other forces', 'POLITICAL MILITIA VERSUS OTHERS (e.g., violence between private security forces and unidentified armed groups; violence between pro-government militia and external state military forces)'),
    (40, 'Identity militia only', 'SOLE IDENTITY MILITIA ACTION (e.g., destruction of property by a communal militia; establishment of a local security militia)'),
    (44, 'Identity militia-Identity militia', 'IDENTITY MILITIA VERSUS IDENTITY MILITIA (e.g., inter-communal violence)'),
    (45, 'Identity militia-Rioters', 'IDENTITY MILITIA VERSUS RIOTERS (e.g., violent demonstration against an identity militia; spontaneous violence against an identity militia)'),
    (46, 'Identity militia-Protesters', 'IDENTITY MILITIA VERSUS PROTESTERS (e.g., suppression of a peaceful demonstration by  an identity militia)'),
    (47, 'Identity militia-Civilians', 'IDENTITY MILITIA VERSUS CIVILIANS (e.g., civilian targeting, especially in the context of inter-communal violence)'),
    (48, 'Identity militia-External/Other forces', 'IDENTITY MILITIA VERSUS OTHER (e.g., external state military engaging in violence against a communal militia)'),
    (50, 'Rioters only', 'SOLE RIOTER ACTION (e.g., one-sided violent demonstration; spontaneous arson)'),
    (55, 'Rioters-Rioters', 'RIOTERS VERSUS RIOTERS (e.g., two-sided violent demonstration in which both sides engage in violence)'),
    (56, 'Rioters-Protesters', 'RIOTERS VERSUS PROTESTERS (e.g., two-sided demonstration in which only one side engages in violence)'),
    (57, 'Rioters-Civilians', 'RIOTERS VERSUS CIVILIANS (e.g., violent demonstration in which civilians are injured/killed; spontaneous violence in which civilians are targeted by a mob)'),
    (58, 'Rioters-External/Other forces', 'RIOTERS VERSUS OTHERS (e.g., mob violence against regional or international operation)'),
    (60, 'Protesters only', 'SOLE PROTESTER ACTION (e.g., one-sided peaceful protest)'),
    (66, 'Protesters-Protesters', 'PROTESTERS VERSUS PROTESTERS (e.g., two-sided peaceful protest)'),
    (67, 'Protesters-Civilians', 'PROTESTERS VERSUS CIVILIANS (e.g., peaceful protesters engaging civilians)'),
    (68, 'Protesters-External/Other forces', 'PROTESTERS VERSUS OTHER (e.g., suppression of a peaceful demonstration by private security forces)'),
    (70, 'Civilians only', 'SOLE CIVILIAN ACTION (e.g., one-sided strategic development)'),
    (77, 'Civilians-Civilians', 'CIVILIANS VERSUS CIVILIANS (e.g., peaceful interactions between civilians recorded as ''Strategic developments'')'),
    (78, 'External/Other forces-Civilians', 'OTHER ACTOR VERSUS CIVILIANS (e.g., regional or international operation targeting civilians; private security forces targeting civilians)'),
    (80, 'External/Other forces only', 'SOLE OTHER ACTION (e.g., strategic developments involving international or regional operations; remote violence by external military forces with no reported target; non-violent external military operations)'),
    (88, 'External/Other forces-External/Other forces', 'OTHER VERSUS OTHER (e.g., clashes between foreign state forces, international missions, or private security forces)');

COMMENT ON TABLE acled_interactions IS 'ACLED interaction codes describing the type of interaction between actors in an event';
COMMENT ON COLUMN acled_interactions.code IS 'Two-digit interaction code: first digit = actor1 type (inter1), second digit = actor2 type (inter2)';
COMMENT ON COLUMN acled_interactions.title IS 'Short title describing the interaction type';
COMMENT ON COLUMN acled_interactions.description IS 'Detailed description with examples of the interaction type';

-- ============================================================================
-- SOURCES TABLES (Normalized)
-- ============================================================================

CREATE TABLE acled_sources (
    source_id SERIAL PRIMARY KEY,
    source_name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE acled_sources IS 'Master list of news sources';

-- Event-Source Relationship (Many-to-Many)
CREATE TABLE acled_event_sources (
    event_id INTEGER NOT NULL REFERENCES acled_events(event_id) ON DELETE CASCADE,
    source_id INTEGER NOT NULL REFERENCES acled_sources(source_id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, source_id)
);

COMMENT ON TABLE acled_event_sources IS 'Links events to their news sources';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Event date index (most common filter)
CREATE INDEX idx_acled_events_date ON acled_events(event_date);
CREATE INDEX idx_acled_events_date_desc ON acled_events(event_date DESC);

-- Event type indexes
CREATE INDEX idx_acled_events_event_type ON acled_events(event_type);
CREATE INDEX idx_acled_events_sub_event_type ON acled_events(sub_event_type);
CREATE INDEX idx_acled_events_event_sub_type ON acled_events(event_type, sub_event_type);

-- Interaction code index
CREATE INDEX idx_acled_events_interaction ON acled_events(interaction_code);

-- Location indexes
CREATE INDEX idx_acled_events_admin1 ON acled_events(admin1);
CREATE INDEX idx_acled_events_admin2 ON acled_events(admin2);
CREATE INDEX idx_acled_events_admin3 ON acled_events(admin3);
CREATE INDEX idx_acled_events_location_hierarchy ON acled_events(admin1, admin2, admin3);

-- Spatial index for coordinates
CREATE INDEX idx_acled_events_coords ON acled_events(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Fatalities index (for filtering events with casualties)
CREATE INDEX idx_acled_events_fatalities ON acled_events(fatalities) WHERE fatalities > 0;

-- Civilian targeting index
CREATE INDEX idx_acled_events_civilian_targeting ON acled_events(civilian_targeting) WHERE civilian_targeting = TRUE;

-- Full-text search index for news content
CREATE INDEX idx_acled_events_notes_fts ON acled_events USING GIN(to_tsvector('english', notes));

-- Composite indexes for common query patterns
CREATE INDEX idx_acled_events_date_type ON acled_events(event_date, event_type);
CREATE INDEX idx_acled_events_date_admin1 ON acled_events(event_date, admin1);

-- Actor indexes
CREATE INDEX idx_acled_actors_name ON acled_actors(actor_name);
CREATE INDEX idx_acled_event_actors_event ON acled_event_actors(event_id);
CREATE INDEX idx_acled_event_actors_actor ON acled_event_actors(actor_id);
CREATE INDEX idx_acled_event_actors_role ON acled_event_actors(actor_role);

-- Source indexes
CREATE INDEX idx_acled_sources_name ON acled_sources(source_name);
CREATE INDEX idx_acled_event_sources_event ON acled_event_sources(event_id);
CREATE INDEX idx_acled_event_sources_source ON acled_event_sources(source_id);

-- ============================================================================
-- ADMINISTRATIVE LOCATION TABLE FOR MAPPING
-- ============================================================================

CREATE TABLE IF NOT EXISTS acled_locations (
    location_id SERIAL PRIMARY KEY,
    admin1 VARCHAR(100),  -- State/Region
    admin2 VARCHAR(100),  -- District
    admin3 VARCHAR(100),  -- Township
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(admin1, admin2, admin3)
);

COMMENT ON TABLE acled_locations IS 'Reference table for ACLED administrative location combinations';
COMMENT ON COLUMN acled_locations.admin1 IS 'State or Region (admin level 1)';
COMMENT ON COLUMN acled_locations.admin2 IS 'District (admin level 2)';
COMMENT ON COLUMN acled_locations.admin3 IS 'Township (admin level 3)';


-- ============================================================================
-- ACLED EVENT TYPES TABLE
-- ============================================================================
-- This table stores unique combinations of event_type and sub_event_type
-- from ACLED data for reference and mapping purposes.

CREATE TABLE IF NOT EXISTS acled_event_types (
    event_type_id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    sub_event_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_type, sub_event_type)
);

COMMENT ON TABLE acled_event_types IS 'Reference table for ACLED event type combinations';
COMMENT ON COLUMN acled_event_types.event_type IS 'Main event type category';
COMMENT ON COLUMN acled_event_types.sub_event_type IS 'Specific sub-category of the event';
-- Insert unique event type combinations
-- Using ON CONFLICT DO NOTHING to skip duplicates on updates
INSERT INTO acled_event_types (event_type, sub_event_type) VALUES ('Battles', 'Armed clash') ON CONFLICT (event_type, sub_event_type) DO NOTHING;
INSERT INTO acled_event_types (event_type, sub_event_type) VALUES ('Battles', 'Government regains territory') ON CONFLICT (event_type, sub_event_type) DO NOTHING;
INSERT INTO acled_event_types (event_type, sub_event_type) VALUES ('Battles', 'Non-state actor overtakes territory') ON CONFLICT (event_type, sub_event_type) DO NOTHING;
INSERT INTO acled_event_types (event_type, sub_event_type) VALUES ('Explosions/Remote violence', 'Air/drone strike') ON CONFLICT (event_type, sub_event_type) DO NOTHING;
INSERT INTO acled_event_types (event_type, sub_event_type) VALUES ('Explosions/Remote violence', 'Chemical weapon') ON CONFLICT (event_type, sub_event_type) DO NOTHING;
INSERT INTO acled_event_types (event_type, sub_event_type) VALUES ('Explosions/Remote violence', 'Grenade') ON CONFLICT (event_type, sub_event_type) DO NOTHING;
INSERT INTO acled_event_types (event_type, sub_event_type) VALUES ('Explosions/Remote violence', 'Remote explosive/landmine/IED') ON CONFLICT (event_type, sub_event_type) DO NOTHING;
INSERT INTO acled_event_types (event_type, sub_event_type) VALUES ('Explosions/Remote violence', 'Shelling/artillery/missile attack') ON CONFLICT (event_type, sub_event_type) DO NOTHING;
INSERT INTO acled_event_types (event_type, sub_event_type) VALUES ('Explosions/Remote violence', 'Suicide bomb') ON CONFLICT (event_type, sub_event_type) DO NOTHING;
INSERT INTO acled_event_types (event_type, sub_event_type) VALUES ('Protests', 'Excessive force against protesters') ON CONFLICT (event_type, sub_event_type) DO NOTHING;
INSERT INTO acled_event_types (event_type, sub_event_type) VALUES ('Protests', 'Peaceful protest') ON CONFLICT (event_type, sub_event_type) DO NOTHING;
INSERT INTO acled_event_types (event_type, sub_event_type) VALUES ('Protests', 'Protest with intervention') ON CONFLICT (event_type, sub_event_type) DO NOTHING;
INSERT INTO acled_event_types (event_type, sub_event_type) VALUES ('Riots', 'Mob violence') ON CONFLICT (event_type, sub_event_type) DO NOTHING;
INSERT INTO acled_event_types (event_type, sub_event_type) VALUES ('Riots', 'Violent demonstration') ON CONFLICT (event_type, sub_event_type) DO NOTHING;
INSERT INTO acled_event_types (event_type, sub_event_type) VALUES ('Strategic developments', 'Agreement') ON CONFLICT (event_type, sub_event_type) DO NOTHING;
INSERT INTO acled_event_types (event_type, sub_event_type) VALUES ('Strategic developments', 'Arrests') ON CONFLICT (event_type, sub_event_type) DO NOTHING;
INSERT INTO acled_event_types (event_type, sub_event_type) VALUES ('Strategic developments', 'Change to group/activity') ON CONFLICT (event_type, sub_event_type) DO NOTHING;
INSERT INTO acled_event_types (event_type, sub_event_type) VALUES ('Strategic developments', 'Disrupted weapons use') ON CONFLICT (event_type, sub_event_type) DO NOTHING;
INSERT INTO acled_event_types (event_type, sub_event_type) VALUES ('Strategic developments', 'Headquarters or base established') ON CONFLICT (event_type, sub_event_type) DO NOTHING;
INSERT INTO acled_event_types (event_type, sub_event_type) VALUES ('Strategic developments', 'Looting/property destruction') ON CONFLICT (event_type, sub_event_type) DO NOTHING;
INSERT INTO acled_event_types (event_type, sub_event_type) VALUES ('Strategic developments', 'Non-violent transfer of territory') ON CONFLICT (event_type, sub_event_type) DO NOTHING;
INSERT INTO acled_event_types (event_type, sub_event_type) VALUES ('Strategic developments', 'Other') ON CONFLICT (event_type, sub_event_type) DO NOTHING;
INSERT INTO acled_event_types (event_type, sub_event_type) VALUES ('Violence against civilians', 'Abduction/forced disappearance') ON CONFLICT (event_type, sub_event_type) DO NOTHING;
INSERT INTO acled_event_types (event_type, sub_event_type) VALUES ('Violence against civilians', 'Attack') ON CONFLICT (event_type, sub_event_type) DO NOTHING;
INSERT INTO acled_event_types (event_type, sub_event_type) VALUES ('Violence against civilians', 'Sexual violence') ON CONFLICT (event_type, sub_event_type) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_acled_event_types_event_type ON acled_event_types(event_type);
CREATE INDEX IF NOT EXISTS idx_acled_event_types_sub_event_type ON acled_event_types(sub_event_type);
-- ============================================================================
-- MATERIALIZED VIEWS FOR COMMON AGGREGATIONS
-- ============================================================================

-- Monthly event summary by region and type
CREATE MATERIALIZED VIEW acled_monthly_event_summary AS
SELECT 
    DATE_TRUNC('month', event_date)::DATE as month,
    admin1,
    event_type,
    sub_event_type,
    COUNT(*) as event_count,
    SUM(fatalities) as total_fatalities,
    COUNT(*) FILTER (WHERE civilian_targeting = TRUE) as civilian_targeting_count
FROM acled_events
GROUP BY 1, 2, 3, 4;

CREATE INDEX idx_acled_monthly_summary_month ON acled_monthly_event_summary(month);
CREATE INDEX idx_acled_monthly_summary_admin1 ON acled_monthly_event_summary(admin1);
CREATE INDEX idx_acled_monthly_summary_type ON acled_monthly_event_summary(event_type);
CREATE UNIQUE INDEX idx_acled_monthly_summary_unique ON acled_monthly_event_summary(month, admin1, event_type, sub_event_type);

COMMENT ON MATERIALIZED VIEW acled_monthly_event_summary IS 'Pre-aggregated monthly statistics for faster dashboard queries';

-- Actor involvement summary
CREATE MATERIALIZED VIEW acled_actor_event_summary AS
SELECT 
    a.actor_id,
    a.actor_name,
    COUNT(DISTINCT ea.event_id) as total_events,
    SUM(e.fatalities) as total_fatalities,
    MIN(e.event_date) as first_event_date,
    MAX(e.event_date) as last_event_date
FROM acled_actors a
JOIN acled_event_actors ea ON a.actor_id = ea.actor_id
JOIN acled_events e ON ea.event_id = e.event_id
GROUP BY a.actor_id, a.actor_name;

CREATE INDEX idx_acled_actor_summary_actor ON acled_actor_event_summary(actor_id);
CREATE INDEX idx_acled_actor_summary_events ON acled_actor_event_summary(total_events DESC);
CREATE UNIQUE INDEX idx_acled_actor_summary_unique ON acled_actor_event_summary(actor_id);

COMMENT ON MATERIALIZED VIEW acled_actor_event_summary IS 'Summary statistics for each actor';

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_acled_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW acled_monthly_event_summary;
    REFRESH MATERIALIZED VIEW acled_actor_event_summary;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_acled_views() IS 'Refresh all ACLED materialized views';

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_acled_events_updated_at
    BEFORE UPDATE ON acled_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- USEFUL QUERIES (as comments for reference)
-- ============================================================================

/*
-- Full-text search in news content
SELECT event_id_cnty, event_date, admin1, notes
FROM acled_events
WHERE to_tsvector('english', notes) @@ to_tsquery('english', 'military & attack');

-- Events by actor
SELECT e.event_id_cnty, e.event_date, e.event_type, a.actor_name
FROM acled_events e
JOIN acled_event_actors ea ON e.event_id = ea.event_id
JOIN acled_actors a ON ea.actor_id = a.actor_id
WHERE a.actor_name LIKE '%Karen National%';

-- Events with multiple sources
SELECT e.event_id_cnty, e.event_date, COUNT(es.source_id) as source_count
FROM acled_events e
JOIN acled_event_sources es ON e.event_id = es.event_id
GROUP BY e.event_id, e.event_id_cnty, e.event_date
HAVING COUNT(es.source_id) > 1;

-- Spatial query (events within bounding box)
SELECT event_id_cnty, event_date, location, latitude, longitude
FROM acled_events
WHERE latitude BETWEEN 16.0 AND 17.0
  AND longitude BETWEEN 97.0 AND 98.0;

-- Timeline of events by type
SELECT event_date, event_type, COUNT(*) as count
FROM acled_events
WHERE event_date >= '2020-01-01'
GROUP BY event_date, event_type
ORDER BY event_date;
*/
