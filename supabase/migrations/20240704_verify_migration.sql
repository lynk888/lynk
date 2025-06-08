-- Verification script for conversation_participants migration

DO $$
DECLARE
    policy_count INTEGER;
    index_count INTEGER;
BEGIN
    -- Check if policies were created correctly
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'conversation_participants';

    ASSERT policy_count = 2, 
        'Expected 2 policies on conversation_participants, found ' || policy_count;

    -- Check if indexes were created
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE tablename = 'conversation_participants'
    AND indexname IN (
        'idx_conversation_participants_user_id',
        'idx_conversation_participants_conversation_user'
    );

    ASSERT index_count = 2, 
        'Expected 2 indexes on conversation_participants, found ' || index_count;

    -- Verify policy names and types
    ASSERT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'conversation_participants'
        AND policyname = 'Users can view their own participant records'
        AND cmd = 'SELECT'
    ), 'SELECT policy not found or incorrect';

    ASSERT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'conversation_participants'
        AND policyname = 'Users can add themselves as participants'
        AND cmd = 'INSERT'
    ), 'INSERT policy not found or incorrect';

    -- Verify policy expressions
    ASSERT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'conversation_participants'
        AND policyname = 'Users can view their own participant records'
        AND qual = '(user_id = auth.uid())'
    ), 'SELECT policy expression incorrect';

    ASSERT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'conversation_participants'
        AND policyname = 'Users can add themselves as participants'
        AND with_check = '(user_id = auth.uid())'
    ), 'INSERT policy expression incorrect';

    RAISE NOTICE 'All verifications passed successfully!';
END $$; 