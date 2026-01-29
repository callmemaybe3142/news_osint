-- Migration script to add actor_code column to existing acled_actors table
-- Run this if the table already exists without the actor_code column

-- Add the actor_code column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'acled_actors' 
        AND column_name = 'actor_code'
    ) THEN
        ALTER TABLE acled_actors 
        ADD COLUMN actor_code SMALLINT CHECK (actor_code >= 0 AND actor_code <= 8);
        
        COMMENT ON COLUMN acled_actors.actor_code IS 
            'ACLED interaction code: 0=No interaction, 1=State Forces, 2=Rebel Groups, 3=Political Militias, 4=Identity Militias, 5=Rioters, 6=Protesters, 7=Civilians, 8=External/Other Forces';
        
        RAISE NOTICE 'Column actor_code added successfully to acled_actors table';
    ELSE
        RAISE NOTICE 'Column actor_code already exists in acled_actors table';
    END IF;
END $$;

-- Create the reference table if it doesn't exist
CREATE TABLE IF NOT EXISTS acled_actor_codes (
    code SMALLINT PRIMARY KEY CHECK (code >= 0 AND code <= 8),
    description VARCHAR(100) NOT NULL,
    notes TEXT
);

-- Insert the ACLED actor code definitions (if not already present)
INSERT INTO acled_actor_codes (code, description, notes) VALUES
    (0, 'No Actor 2 / No Interaction', 'Used when there is no second actor or no interaction'),
    (1, 'State Forces', 'Government military, police, and security forces'),
    (2, 'Rebel Groups', 'Armed opposition groups and insurgents'),
    (3, 'Political Militias', 'Armed groups affiliated with political parties'),
    (4, 'Identity Militias', 'Ethnic, religious, or communal militias'),
    (5, 'Rioters', 'Violent mob or crowd actions'),
    (6, 'Protesters', 'Non-violent demonstrators and protesters'),
    (7, 'Civilians', 'Unarmed civilian population'),
    (8, 'External/Other Forces', 'Foreign military, private security, international organizations')
ON CONFLICT (code) DO NOTHING;

COMMENT ON TABLE acled_actor_codes IS 'Reference table for ACLED actor/interaction codes';

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'acled_actors' 
AND column_name = 'actor_code';

-- Show current actor count
SELECT COUNT(*) as total_actors FROM acled_actors;
