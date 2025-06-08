-- Check existing RLS policies
SELECT * FROM pg_policies WHERE tablename = 'conversation_participants';

-- Check if RLS is enabled
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'conversation_participants'; 