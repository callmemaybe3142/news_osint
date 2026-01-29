-- ============================================================================
-- ACLED INTERACTION CODES TABLE
-- ============================================================================
-- This table stores the ACLED interaction codes that describe the type of
-- interaction between actor1 and actor2 in an event.
-- The interaction code is a 2-digit number where:
--   - First digit represents actor1 type (inter1)
--   - Second digit represents actor2 type (inter2)

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

-- Create index for faster lookups
CREATE INDEX idx_acled_interactions_code ON acled_interactions(code);
