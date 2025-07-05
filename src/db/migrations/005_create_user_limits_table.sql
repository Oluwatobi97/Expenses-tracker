-- Migration: Create user_limits table for daily and monthly spending limits
CREATE TABLE IF NOT EXISTS user_limits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    daily_limit NUMERIC(10, 2),
    monthly_limit NUMERIC(10, 2),
    daily_limit_enabled BOOLEAN DEFAULT FALSE,
    monthly_limit_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_limits_user_id ON user_limits(user_id); 