-- ============================================================================
-- User Authentication Schema for News Viewer with Role-Based Access Control
-- ============================================================================

-- Users table with role-based access
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role INTEGER NOT NULL DEFAULT 0,  -- 0: Basic, 1: Advanced, 2: Admin, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

COMMENT ON TABLE users IS 'Users with authentication credentials and role-based access for news viewer';
COMMENT ON COLUMN users.username IS 'Unique username for login';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password';
COMMENT ON COLUMN users.role IS 'User role level: 0=Basic (News only), 1=Advanced, 2=Admin (Person data access), 3+=Super Admin';

-- ============================================================================
-- Migration: Add role column to existing users table
-- Run this if you already have a users table
-- ============================================================================

-- Add role column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role'
    ) THEN
        ALTER TABLE users ADD COLUMN role INTEGER NOT NULL DEFAULT 0;
        CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
        COMMENT ON COLUMN users.role IS 'User role level: 0=Basic (News only), 1=Advanced, 2=Admin (Person data access), 3+=Super Admin';
    END IF;
END $$;
