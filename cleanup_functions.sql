-- Comprehensive cleanup script to remove all conflicting functions
-- Run this BEFORE running any migrations to avoid function conflicts

-- Drop all versions of search_users function
DROP FUNCTION IF EXISTS search_users(text);
DROP FUNCTION IF EXISTS search_users(text, integer);
DROP FUNCTION IF EXISTS search_users(text, integer, integer);
DROP FUNCTION IF EXISTS search_users_basic(text, integer, integer);

-- Drop all versions of is_user_blocked function
DROP FUNCTION IF EXISTS is_user_blocked(UUID);
DROP FUNCTION IF EXISTS is_user_blocked(target_user_id UUID);

-- Drop update_user_last_seen function if it exists
DROP FUNCTION IF EXISTS update_user_last_seen();

-- Drop any other potentially conflicting functions
DROP FUNCTION IF EXISTS check_user_blocked(UUID);
DROP FUNCTION IF EXISTS user_blocked_check(UUID);

-- List all functions to verify cleanup (optional - for debugging)
-- SELECT routine_name, routine_type, specific_name 
-- FROM information_schema.routines 
-- WHERE routine_schema = 'public' 
-- AND routine_name LIKE '%user%' OR routine_name LIKE '%search%' OR routine_name LIKE '%block%';

-- Now you can safely run the migration files
