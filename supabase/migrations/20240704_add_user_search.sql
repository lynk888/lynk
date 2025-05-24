-- Add index for username search
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Function to search users by username
CREATE OR REPLACE FUNCTION search_users(search_term TEXT)
RETURNS TABLE (
    id UUID,
    username TEXT,
    avatar_url TEXT,
    email TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.username,
        p.avatar_url,
        p.email
    FROM profiles p
    WHERE 
        p.username ILIKE '%' || search_term || '%'
    ORDER BY 
        CASE 
            WHEN p.username ILIKE search_term || '%' THEN 1
            WHEN p.username ILIKE '%' || search_term || '%' THEN 2
            ELSE 3
        END,
        p.username
    LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Policy to allow users to search other users
DROP POLICY IF EXISTS "Users can search other users" ON profiles;
CREATE POLICY "Users can search other users"
ON profiles FOR SELECT
USING (true); 