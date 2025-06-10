-- Add blocking functionality
CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a user can't block the same person twice
  UNIQUE(user_id, blocked_user_id),
  
  -- Ensure a user can't block themselves
  CHECK (user_id != blocked_user_id)
);

-- Add indexes for blocked_users
CREATE INDEX IF NOT EXISTS idx_blocked_users_user_id ON blocked_users(user_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked_user_id ON blocked_users(blocked_user_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked_at ON blocked_users(blocked_at DESC);

-- Add RLS policies for blocked_users
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- Users can only see their own blocked users
CREATE POLICY "Users can view their own blocked users" ON blocked_users
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only block/unblock for themselves
CREATE POLICY "Users can manage their own blocks" ON blocked_users
  FOR ALL USING (auth.uid() = user_id);

-- Add additional profile fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add conversation participants archiving
ALTER TABLE conversation_participants ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE conversation_participants ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for new profile fields
CREATE INDEX IF NOT EXISTS idx_profiles_is_online ON profiles(is_online);
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen ON profiles(last_seen DESC);

-- Add indexes for conversation archiving
CREATE INDEX IF NOT EXISTS idx_conversation_participants_archived ON conversation_participants(user_id, is_archived);

-- Function to update last_seen when user goes offline
CREATE OR REPLACE FUNCTION update_user_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_online = false AND OLD.is_online = true THEN
    NEW.last_seen = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update last_seen
DROP TRIGGER IF EXISTS trigger_update_last_seen ON profiles;
CREATE TRIGGER trigger_update_last_seen
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_last_seen();

-- Drop existing search_users function if it exists
DROP FUNCTION IF EXISTS search_users(text, integer, integer);

-- Function to search users (excluding blocked users)
CREATE OR REPLACE FUNCTION search_users(
  search_term TEXT,
  page_number INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  interests TEXT[],
  is_online BOOLEAN,
  last_seen TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  offset_count INTEGER;
BEGIN
  offset_count := (page_number - 1) * page_size;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.email,
    p.avatar_url,
    p.bio,
    p.interests,
    p.is_online,
    p.last_seen,
    p.created_at,
    p.updated_at
  FROM profiles p
  WHERE 
    (p.username ILIKE '%' || search_term || '%' OR p.email ILIKE '%' || search_term || '%')
    AND p.id != COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID)
    AND p.id NOT IN (
      -- Exclude users that current user has blocked
      SELECT blocked_user_id FROM blocked_users WHERE user_id = auth.uid()
    )
    AND p.id NOT IN (
      -- Exclude users that have blocked current user
      SELECT user_id FROM blocked_users WHERE blocked_user_id = auth.uid()
    )
  ORDER BY 
    CASE WHEN p.is_online THEN 0 ELSE 1 END,
    p.last_seen DESC,
    p.username
  LIMIT page_size
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on search function
GRANT EXECUTE ON FUNCTION search_users TO authenticated;

-- Update existing RLS policies to consider blocking
-- Note: This assumes you want to prevent blocked users from seeing each other's data

-- Drop existing is_user_blocked function if it exists (all possible signatures)
DROP FUNCTION IF EXISTS is_user_blocked(UUID);
DROP FUNCTION IF EXISTS is_user_blocked(target_user_id UUID);

-- Function to check if user is blocked
CREATE OR REPLACE FUNCTION is_user_blocked(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM blocked_users
    WHERE (user_id = auth.uid() AND blocked_user_id = target_user_id)
       OR (user_id = target_user_id AND blocked_user_id = auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on blocking check function
GRANT EXECUTE ON FUNCTION is_user_blocked TO authenticated;
