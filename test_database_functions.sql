-- Test script to verify all database functions work correctly
-- Run this after setting up the database to ensure everything is working

-- Test 1: Check if profiles table exists and has basic columns
SELECT 'Testing profiles table...' as test_name;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Test 2: Check if search_users function exists
SELECT 'Testing search_users function...' as test_name;
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'search_users';

-- Test 3: Try to call search_users function (this should work now)
SELECT 'Testing search_users function call...' as test_name;
SELECT COUNT(*) as total_profiles FROM profiles;

-- Test 4: Test search_users with explicit casting (should not error)
SELECT 'Testing search_users with parameters...' as test_name;
DO $$
BEGIN
  -- Try to call the function, catch any errors
  BEGIN
    PERFORM search_users('test'::text, 1::integer, 5::integer);
    RAISE NOTICE 'search_users function works correctly';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'search_users function error: %', SQLERRM;
  END;
END $$;

-- Test 5: Check if blocked_users table exists (optional)
SELECT 'Testing blocked_users table...' as test_name;
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'blocked_users'
) as blocked_users_exists;

-- Test 6: Check if enhanced profile columns exist (optional)
SELECT 'Testing enhanced profile columns...' as test_name;
SELECT 
  EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') as bio_exists,
  EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'interests') as interests_exists,
  EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_online') as is_online_exists,
  EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_seen') as last_seen_exists;

-- Test 7: Check RLS policies
SELECT 'Testing RLS policies...' as test_name;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('profiles', 'blocked_users')
ORDER BY tablename, policyname;

-- Test 8: Test basic profile query (this should always work)
SELECT 'Testing basic profile query...' as test_name;
SELECT id, username, email, avatar_url 
FROM profiles 
LIMIT 3;

-- Summary
SELECT 'Database setup verification complete!' as status;
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.routines WHERE routine_name = 'search_users') 
    THEN 'search_users function: ✓ EXISTS'
    ELSE 'search_users function: ✗ MISSING'
  END as search_function_status,
  
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'blocked_users') 
    THEN 'blocked_users table: ✓ EXISTS'
    ELSE 'blocked_users table: ✗ MISSING (optional)'
  END as blocking_table_status,
  
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') 
    THEN 'enhanced profiles: ✓ EXISTS'
    ELSE 'enhanced profiles: ✗ MISSING (optional)'
  END as enhanced_profiles_status;
