-- Migration: Add Groups feature
-- Description: Creates groups and group_members tables with invite link support

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invite_code VARCHAR(32) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on owner_user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_groups_owner ON groups(owner_user_id);

-- Create index on invite_code for invite link lookups
CREATE INDEX IF NOT EXISTS idx_groups_invite_code ON groups(invite_code);

-- Create group_members junction table
CREATE TABLE IF NOT EXISTS group_members (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(group_id, user_id)
);

-- Create composite index for fast member lookups
CREATE INDEX IF NOT EXISTS idx_group_members_group_user ON group_members(group_id, user_id);

-- Create index on user_id for finding all groups a user belongs to
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);

-- Note: When owner creates a group, they are automatically added as a member with role='owner'
-- When owner leaves (deletes their membership), the entire group is deleted via application logic
