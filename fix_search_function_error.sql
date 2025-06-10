-- Quick fix for the search_users function error
-- Run this first to resolve the "cannot change return type" error

-- Drop all existing versions of the search_users function
DROP FUNCTION IF EXISTS search_users(text);
DROP FUNCTION IF EXISTS search_users(text, integer);
DROP FUNCTION IF EXISTS search_users(text, integer, integer);

-- Drop any conflicting blocking functions
DROP FUNCTION IF EXISTS is_user_blocked(UUID);
DROP FUNCTION IF EXISTS is_user_blocked(target_user_id UUID);

-- Recreate with the correct signature
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
  is_online BOOLEAN,
  last_seen TIMESTAMP WITH TIME ZONE
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
    COALESCE(p.is_online, false) as is_online,
    COALESCE(p.last_seen, p.created_at) as last_seen
  FROM profiles p
  WHERE 
    (p.username ILIKE '%' || search_term || '%' OR p.email ILIKE '%' || search_term || '%')
    AND p.id != COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID)
  ORDER BY 
    CASE WHEN COALESCE(p.is_online, false) THEN 0 ELSE 1 END,
    COALESCE(p.last_seen, p.created_at) DESC,
    p.username
  LIMIT page_size
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION search_users TO authenticated;
