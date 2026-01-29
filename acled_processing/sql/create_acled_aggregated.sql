-- ============================================================================
-- ACLED AGGREGATED WEEKLY DATA TABLE
-- ============================================================================
-- This table stores weekly aggregated ACLED data for Myanmar, including
-- event counts, fatalities, and population exposure by admin region and event type.

CREATE TABLE IF NOT EXISTS acled_aggregated (
    aggregated_id SERIAL PRIMARY KEY,
    week DATE NOT NULL,
    admin1 VARCHAR(100),
    event_type VARCHAR(100),
    sub_event_type VARCHAR(100),
    events INTEGER DEFAULT 0 CHECK (events >= 0),
    fatalities INTEGER DEFAULT 0 CHECK (fatalities >= 0),
    population_exposure INTEGER DEFAULT 0 CHECK (population_exposure >= 0),
    disorder_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint to prevent duplicate weekly aggregations
    UNIQUE(week, admin1, event_type, sub_event_type)
);

-- Comments
COMMENT ON TABLE acled_aggregated IS 'Weekly aggregated ACLED conflict data for Myanmar';
COMMENT ON COLUMN acled_aggregated.week IS 'Week ending date for the aggregated data';
COMMENT ON COLUMN acled_aggregated.admin1 IS 'State or Region (admin level 1)';
COMMENT ON COLUMN acled_aggregated.event_type IS 'Main event type category';
COMMENT ON COLUMN acled_aggregated.sub_event_type IS 'Specific sub-category of the event';
COMMENT ON COLUMN acled_aggregated.events IS 'Number of events in this week/region/type combination';
COMMENT ON COLUMN acled_aggregated.fatalities IS 'Total fatalities in this week/region/type combination';
COMMENT ON COLUMN acled_aggregated.population_exposure IS 'Estimated population exposed to events';
COMMENT ON COLUMN acled_aggregated.disorder_type IS 'Type of disorder (e.g., Political violence, Demonstrations)';

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_acled_aggregated_week ON acled_aggregated(week);
CREATE INDEX IF NOT EXISTS idx_acled_aggregated_admin1 ON acled_aggregated(admin1);
CREATE INDEX IF NOT EXISTS idx_acled_aggregated_event_type ON acled_aggregated(event_type);
CREATE INDEX IF NOT EXISTS idx_acled_aggregated_week_admin1 ON acled_aggregated(week, admin1);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_acled_aggregated_lookup 
    ON acled_aggregated(week, admin1, event_type, sub_event_type);
