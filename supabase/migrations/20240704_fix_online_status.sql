-- First, let's check if the columns exist and add them if they don't
DO $$ 
BEGIN
    -- Add is_online column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'is_online'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_online BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add last_seen column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'last_seen'
    ) THEN
        ALTER TABLE profiles ADD COLUMN last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Drop existing function and trigger if they exist
DROP TRIGGER IF EXISTS update_last_seen_trigger ON profiles;
DROP FUNCTION IF EXISTS update_last_seen();

-- Create the update_last_seen function
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_seen = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER update_last_seen_trigger
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_last_seen();

-- Drop existing search_users function if it exists
DROP FUNCTION IF EXISTS search_users(TEXT, INTEGER, INTEGER);

-- Create the search_users function
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

-- Enable Row Level Security for profiles if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create or replace policy for viewing profiles
DROP POLICY IF EXISTS "Users can view any profile" ON profiles;
CREATE POLICY "Users can view any profile"
ON profiles FOR SELECT
USING (true);

-- Create or replace policy for updating own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Enable real-time for profiles table
ALTER PUBLICATION supabase_realtime ADD TABLE profiles; 