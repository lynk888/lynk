-- Fix search_users function by dropping and recreating with correct signature

-- Drop all versions of the search_users function
DROP FUNCTION IF EXISTS search_users(text);
DROP FUNCTION IF EXISTS search_users(text, integer);
DROP FUNCTION IF EXISTS search_users(text, integer, integer);

-- Also drop any existing blocking-related functions that might conflict
DROP FUNCTION IF EXISTS is_user_blocked(UUID);
DROP FUNCTION IF EXISTS is_user_blocked(target_user_id UUID);

-- Create the search_users function with enhanced return type
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

-- Also create a simpler version for basic search without blocking checks
-- (in case the blocking table doesn't exist yet)
CREATE OR REPLACE FUNCTION search_users_basic(
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
  ORDER BY 
    CASE WHEN p.is_online THEN 0 ELSE 1 END,
    p.last_seen DESC,
    p.username
  LIMIT page_size
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on basic search function
GRANT EXECUTE ON FUNCTION search_users_basic TO authenticated;
