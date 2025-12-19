-- ============================================================================
-- PostgreSQL Schema for Telegram News Collection System
-- ============================================================================

-- ============================================================================
-- 1. CHANNELS TABLE
-- ============================================================================
-- Stores Telegram channels to monitor
CREATE TABLE IF NOT EXISTS channels (
    telegram_channel_id BIGINT PRIMARY KEY,     -- Telegram's actual channel ID (used as PK)
    name TEXT NOT NULL UNIQUE,                  -- Channel username (e.g., 'nugmyanmar')
    display_name TEXT,                          -- Human-readable name
    category TEXT,                              -- Channel category
    last_fetched_datetime TIMESTAMP WITH TIME ZONE, -- Last fetch timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_channels_name ON channels(name);

-- ============================================================================
-- 2. MESSAGES TABLE
-- ============================================================================
-- Stores collected messages with duplicate detection
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL,                               -- Auto-increment ID for sequential ordering
    channel_id BIGINT NOT NULL,                 -- Telegram channel ID (references channels)
    message_id BIGINT NOT NULL,                 -- Telegram message ID
    message_text TEXT,                          -- NULL for duplicates, forwards, or photo-only messages
    message_datetime TIMESTAMP WITH TIME ZONE NOT NULL, -- Message timestamp
    has_media SMALLINT DEFAULT 0,               -- Boolean: 1 if message has photo
    is_duplicate SMALLINT DEFAULT 0,            -- Boolean: 1 if duplicate text
    is_forwarded SMALLINT DEFAULT 0,            -- Boolean: 1 if forwarded message
    duplicate_of_channel_id BIGINT,             -- Channel ID of original message (if duplicate)
    duplicate_of_message_id BIGINT,             -- Message ID of original message (if duplicate)
    forward_from_channel_id BIGINT,             -- Telegram channel ID of forwarded source
    forward_from_message_id BIGINT,             -- Message ID in the forwarded source channel
    text_hash TEXT,                             -- MD5 hash for duplicate detection
    grouped_id BIGINT,                          -- Telegram's grouped_id for media albums
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),                           -- Auto-increment primary key
    UNIQUE (channel_id, message_id),            -- Unique constraint on Telegram IDs
    FOREIGN KEY (channel_id) REFERENCES channels(telegram_channel_id) ON DELETE CASCADE,
    FOREIGN KEY (duplicate_of_channel_id, duplicate_of_message_id) 
        REFERENCES messages(channel_id, message_id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_text_hash ON messages(text_hash);
CREATE INDEX IF NOT EXISTS idx_messages_datetime ON messages(message_datetime);
CREATE INDEX IF NOT EXISTS idx_messages_has_media ON messages(has_media);
CREATE INDEX IF NOT EXISTS idx_messages_is_duplicate ON messages(is_duplicate);
CREATE INDEX IF NOT EXISTS idx_messages_is_forwarded ON messages(is_forwarded);
CREATE INDEX IF NOT EXISTS idx_messages_duplicate_of ON messages(duplicate_of_channel_id, duplicate_of_message_id);
CREATE INDEX IF NOT EXISTS idx_messages_grouped_id ON messages(grouped_id);
CREATE INDEX IF NOT EXISTS idx_messages_forward_from ON messages(forward_from_channel_id, forward_from_message_id);

-- Full-text search index for message text
-- Using 'simple' configuration for Burmese language support (no stemming, works with any language)
CREATE INDEX IF NOT EXISTS idx_messages_text_fts ON messages 
USING GIN(to_tsvector('simple', COALESCE(message_text, '')));

-- ============================================================================
-- 3. IMAGES TABLE
-- ============================================================================
-- Stores photo metadata and file paths
CREATE TABLE IF NOT EXISTS images (
    id SERIAL PRIMARY KEY,
    message_channel_id BIGINT NOT NULL,
    message_message_id BIGINT NOT NULL,
    file_id TEXT NOT NULL UNIQUE,              -- Telegram's unique file identifier
    file_path TEXT NOT NULL,                   -- Local file path
    original_size BIGINT,                      -- Original file size in bytes
    compressed_size BIGINT,                    -- Compressed file size in bytes
    width INTEGER,                             -- Image width in pixels
    height INTEGER,                            -- Image height in pixels
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (message_channel_id, message_message_id) 
        REFERENCES messages(channel_id, message_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_images_message ON images(message_channel_id, message_message_id);
CREATE INDEX IF NOT EXISTS idx_images_file_id ON images(file_id);

-- ============================================================================
-- 4. EXCLUSION RULES TABLE
-- ============================================================================
-- Stores rules for filtering out unwanted messages
CREATE TABLE IF NOT EXISTS exclusion_rules (
    id SERIAL PRIMARY KEY,
    pattern TEXT NOT NULL,                     -- Pattern to match
    rule_type TEXT NOT NULL DEFAULT 'contains', -- 'exact' or 'contains'
    is_case_sensitive SMALLINT DEFAULT 0,      -- Boolean: 1 for case-sensitive
    description TEXT,                          -- Optional description
    is_active SMALLINT DEFAULT 1,              -- Boolean: 1 if rule is active
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exclusion_rules_active ON exclusion_rules(is_active);

-- ============================================================================
-- COMMENTS (PostgreSQL Documentation)
-- ============================================================================

COMMENT ON TABLE channels IS 'Telegram channels being monitored';
COMMENT ON COLUMN channels.telegram_channel_id IS 'Telegram''s unique channel identifier';
COMMENT ON COLUMN channels.name IS 'Channel username without @ symbol';
COMMENT ON COLUMN channels.display_name IS 'Human-readable channel name';

COMMENT ON TABLE messages IS 'Collected messages from Telegram channels';
COMMENT ON COLUMN messages.has_media IS '1 if message contains photos';
COMMENT ON COLUMN messages.is_duplicate IS '1 if message text is a duplicate';
COMMENT ON COLUMN messages.is_forwarded IS '1 if message was forwarded from another channel';
COMMENT ON COLUMN messages.duplicate_of_channel_id IS 'Points to original message if this is a duplicate';
COMMENT ON COLUMN messages.forward_from_channel_id IS 'Source channel if this is a forwarded message';
COMMENT ON COLUMN messages.text_hash IS 'MD5 hash of message text for duplicate detection';
COMMENT ON COLUMN messages.grouped_id IS 'Telegram''s grouped_id for media albums';

COMMENT ON TABLE images IS 'Metadata for downloaded photos';
COMMENT ON COLUMN images.file_id IS 'Telegram''s unique file identifier';
COMMENT ON COLUMN images.file_path IS 'Relative path to stored image file';

COMMENT ON TABLE exclusion_rules IS 'Rules for filtering unwanted messages';
COMMENT ON COLUMN exclusion_rules.rule_type IS 'Match type: exact or contains';
