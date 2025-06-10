-- Create a basic search function that works with existing schema
-- This version only uses columns that definitely exist in the profiles table

-- First, clean up any existing functions
DROP FUNCTION IF EXISTS search_users(text);
DROP FUNCTION IF EXISTS search_users(text, integer);
DROP FUNCTION IF EXISTS search_users(text, integer, integer);
DROP FUNCTION IF EXISTS search_users_basic(text, integer, integer);

-- Create a simple search function using only basic profile fields
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
    p.created_at,
    p.updated_at
  FROM profiles p
  WHERE 
    (p.username ILIKE '%' || search_term || '%' OR p.email ILIKE '%' || search_term || '%')
    AND p.id != COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID)
  ORDER BY 
    p.username
  LIMIT page_size
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION search_users TO authenticated;

-- Test the function
SELECT 'Function created successfully' as status;

-- You can test it with:
-- SELECT * FROM search_users('test'::text, 1, 5);
