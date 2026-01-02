-- ============================================================================
-- User Authentication Schema for News Viewer
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

COMMENT ON TABLE users IS 'Users with authentication credentials for news viewer';
COMMENT ON COLUMN users.username IS 'Unique username for login';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password';
