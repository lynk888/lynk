-- Update the search_users function to support pagination
CREATE OR REPLACE FUNCTION search_users(
    search_term TEXT,
    page_number INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 20
)
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
    LIMIT page_size
    OFFSET (page_number - 1) * page_size;
END;
$$ LANGUAGE plpgsql; 