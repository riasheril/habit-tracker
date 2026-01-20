-- Migration: Add authentication support
-- Description: Creates users table and adds user_id to habits table

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on clerk_user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_user_id);

-- Add user_id column to habits table
ALTER TABLE habits ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

-- Create index on habits.user_id for fast filtering
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);

-- Note: habit_completions inherits user isolation through habits.user_id
-- No changes needed to habit_completions table
