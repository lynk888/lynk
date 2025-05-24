-- Add online status to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create a function to update last_seen
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_seen = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update last_seen
DROP TRIGGER IF EXISTS update_last_seen_trigger ON profiles;
CREATE TRIGGER update_last_seen_trigger
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_last_seen();

-- Update search_users function to include online status
CREATE OR REPLACE FUNCTION search_users(
    search_term TEXT,
    page_number INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    username TEXT,
    avatar_url TEXT,
    email TEXT,
    is_online BOOLEAN,
    last_seen TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.username,
        p.avatar_url,
        p.email,
        p.is_online,
        p.last_seen
    FROM profiles p
    WHERE
        p.username ILIKE '%' || search_term || '%'
        OR p.email ILIKE '%' || search_term || '%'
    ORDER BY
        CASE
            WHEN p.username ILIKE search_term || '%' THEN 1
            WHEN p.username ILIKE '%' || search_term || '%' THEN 2
            WHEN p.email ILIKE search_term || '%' THEN 3
            WHEN p.email ILIKE '%' || search_term || '%' THEN 4
            ELSE 5
        END,
        p.username
    LIMIT page_size
    OFFSET (page_number - 1) * page_size;
END;
$$ LANGUAGE plpgsql;

-- Create an index for better performance on online status queries
CREATE INDEX IF NOT EXISTS idx_profiles_online_status ON profiles(is_online, last_seen);

-- Create an index for better search performance
CREATE INDEX IF NOT EXISTS idx_profiles_search ON profiles(username, email);

-- Add RLS policies for online status
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read all profiles (for search and online status)
CREATE POLICY "Users can read all profiles" ON profiles
    FOR SELECT USING (true);

-- Policy to allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);