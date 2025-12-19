-- SQLite Schema for News Collection System
-- This schema supports text message collection with photo attachments,
-- duplicate detection, and exclusion rules.

-- ============================================================================
-- 1. CHANNELS TABLE
-- ============================================================================
-- Stores Telegram channels to monitor
CREATE TABLE IF NOT EXISTS channels (
    telegram_channel_id INTEGER PRIMARY KEY,    -- Telegram's actual channel ID (used as PK)
    name TEXT NOT NULL UNIQUE,                  -- Channel username (e.g., 'nugmyanmar')
    display_name TEXT,                          -- Human-readable name
    category TEXT,                              -- Channel category
    last_fetched_datetime TEXT,                 -- ISO 8601 format timestamp
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_channels_name ON channels(name);

-- ============================================================================
-- 2. MESSAGES TABLE
-- ============================================================================
-- Stores collected messages with duplicate detection
CREATE TABLE IF NOT EXISTS messages (
    channel_id INTEGER NOT NULL,               -- Telegram channel ID (references channels)
    message_id INTEGER NOT NULL,               -- Telegram message ID
    message_text TEXT,                         -- NULL for duplicates, forwards, or photo-only messages
    message_datetime TEXT NOT NULL,            -- ISO 8601 format
    has_media INTEGER DEFAULT 0,               -- Boolean: 1 if message has photo
    is_duplicate INTEGER DEFAULT 0,            -- Boolean: 1 if duplicate text
    is_forwarded INTEGER DEFAULT 0,            -- Boolean: 1 if forwarded message
    duplicate_of_channel_id INTEGER,           -- Channel ID of original message (if duplicate)
    duplicate_of_message_id INTEGER,           -- Message ID of original message (if duplicate)
    forward_from_channel_id INTEGER,           -- Telegram channel ID of forwarded source
    forward_from_message_id INTEGER,           -- Message ID in the forwarded source channel
    text_hash TEXT,                            -- MD5 hash for duplicate detection
    grouped_id INTEGER,                        -- Telegram's grouped_id for media albums
    created_at TEXT DEFAULT (datetime('now')),
    
    PRIMARY KEY (channel_id, message_id),
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

-- ============================================================================
-- 3. IMAGES TABLE
-- ============================================================================
-- Stores photo metadata and file paths
CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_channel_id INTEGER NOT NULL,
    message_message_id INTEGER NOT NULL,
    file_id TEXT NOT NULL UNIQUE,           -- Telegram's unique file identifier
    file_path TEXT NOT NULL,                -- Local file path
    original_size INTEGER,                  -- Original file size in bytes
    compressed_size INTEGER,                -- Compressed file size in bytes
    width INTEGER,                          -- Image width in pixels
    height INTEGER,                         -- Image height in pixels
    created_at TEXT DEFAULT (datetime('now')),
    
    FOREIGN KEY (message_channel_id, message_message_id) 
        REFERENCES messages(channel_id, message_id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_images_file_id ON images(file_id);
CREATE INDEX IF NOT EXISTS idx_images_message ON images(message_channel_id, message_message_id);

-- ============================================================================
-- 4. EXCLUSION RULES TABLE
-- ============================================================================
-- Stores patterns to exclude (ads, spam, etc.)
CREATE TABLE IF NOT EXISTS exclusion_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pattern TEXT NOT NULL,                  -- Text pattern to match
    rule_type TEXT NOT NULL CHECK(rule_type IN ('exact', 'contains')),
    is_case_sensitive INTEGER DEFAULT 0,    -- Boolean: 1 for case-sensitive matching
    is_active INTEGER DEFAULT 1,            -- Boolean: 1 if rule is active
    description TEXT,                       -- Optional description
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_exclusion_rules_active ON exclusion_rules(is_active);

-- ============================================================================
-- EXAMPLE DATA
-- ============================================================================

-- Example channels (commented out - add via application)
-- INSERT INTO channels (name, display_name, category) VALUES
--     ('nugmyanmar', 'National Unity Government of Myanmar', 'Politics'),
--     ('itvisionchannel', 'IT Vision', 'Technology');

-- Example exclusion rules (commented out - add via application)
-- INSERT INTO exclusion_rules (pattern, rule_type, is_case_sensitive, description) VALUES
--     ('Join our premium channel', 'exact', 0, 'Premium channel spam'),
--     ('Subscribe now', 'contains', 0, 'Subscription spam'),
--     ('ကြော်ငြာ', 'contains', 0, 'Advertisement in Burmese');

-- ============================================================================
-- USEFUL QUERIES
-- ============================================================================

-- Get all original messages (non-duplicates) with their images
-- SELECT 
--     m.message_text,
--     m.message_datetime,
--     c.display_name,
--     i.file_path
-- FROM messages m
-- JOIN channels c ON m.channel_id = c.id
-- LEFT JOIN images i ON m.channel_id = i.message_channel_id 
--     AND m.message_id = i.message_message_id
-- WHERE m.is_duplicate = 0
-- ORDER BY m.message_datetime DESC;

-- Count duplicates by original message
-- SELECT 
--     m1.message_text,
--     COUNT(*) as duplicate_count
-- FROM messages m1
-- JOIN messages m2 ON m1.channel_id = m2.original_channel_id 
--     AND m1.message_id = m2.original_message_id
-- WHERE m2.is_duplicate = 1
-- GROUP BY m1.channel_id, m1.message_id
-- ORDER BY duplicate_count DESC;
