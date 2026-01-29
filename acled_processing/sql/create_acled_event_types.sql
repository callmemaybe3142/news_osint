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