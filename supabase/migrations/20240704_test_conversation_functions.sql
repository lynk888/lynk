-- Test script for conversation functions

DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    user3_id UUID;
    non_participant_id UUID;
    conversation_id UUID;
    test_result BOOLEAN;
BEGIN
    -- Clean up any existing test data
    DELETE FROM conversation_participants 
    WHERE user_id IN (
        SELECT id FROM auth.users 
        WHERE email LIKE 'test%@example.com' 
        OR email = 'nonparticipant@example.com'
    );
    
    DELETE FROM conversations 
    WHERE id IN (
        SELECT conversation_id 
        FROM conversation_participants 
        WHERE user_id IN (
            SELECT id FROM auth.users 
            WHERE email LIKE 'test%@example.com' 
            OR email = 'nonparticipant@example.com'
        )
    );
    
    DELETE FROM profiles 
    WHERE email LIKE 'test%@example.com' 
    OR email = 'nonparticipant@example.com';
    
    DELETE FROM auth.users 
    WHERE email LIKE 'test%@example.com' 
    OR email = 'nonparticipant@example.com';

    -- Create test users one by one
    user1_id := gen_random_uuid();
    user2_id := gen_random_uuid();
    user3_id := gen_random_uuid();
    non_participant_id := gen_random_uuid();

    -- Insert users
    INSERT INTO auth.users (id, email)
    VALUES 
        (user1_id, 'test1@example.com'),
        (user2_id, 'test2@example.com'),
        (user3_id, 'test3@example.com'),
        (non_participant_id, 'nonparticipant@example.com');

    -- Create profiles for the users
    INSERT INTO profiles (id, username, email)
    VALUES 
        (user1_id, 'testuser1', 'test1@example.com'),
        (user2_id, 'testuser2', 'test2@example.com'),
        (user3_id, 'testuser3', 'test3@example.com'),
        (non_participant_id, 'nonparticipant', 'nonparticipant@example.com');

    RAISE NOTICE 'Created test users: % (creator), %, %, % (non-participant)', 
        user1_id, user2_id, user3_id, non_participant_id;

    -- Test 1: Create a conversation with multiple participants
    SET LOCAL ROLE authenticated;
    SET LOCAL "request.jwt.claim.sub" TO user1_id;
    
    SELECT create_conversation_with_participants(
        user1_id,
        ARRAY[user2_id, user3_id]
    ) INTO conversation_id;

    RAISE NOTICE 'Created conversation with ID: %', conversation_id;

    -- Test 2: Verify all participants were added
    SELECT EXISTS (
        SELECT 1 FROM conversation_participants
        WHERE conversation_id = conversation_id
        AND user_id IN (user1_id, user2_id, user3_id)
        HAVING COUNT(DISTINCT user_id) = 3
    ) INTO test_result;

    ASSERT test_result, 'Not all participants were added to the conversation';

    -- Test 3: Try to add a duplicate participant
    PERFORM add_conversation_participant(conversation_id, user1_id);
    
    SELECT COUNT(*) = 3 INTO test_result
    FROM conversation_participants
    WHERE conversation_id = conversation_id;

    ASSERT test_result, 'Duplicate participant was added';

    -- Test 4: Verify participants can view the conversation
    SET LOCAL "request.jwt.claim.sub" TO user2_id;
    
    SELECT EXISTS (
        SELECT 1 FROM conversations c
        JOIN conversation_participants cp ON cp.conversation_id = c.id
        WHERE c.id = conversation_id
        AND cp.user_id = user2_id
    ) INTO test_result;

    ASSERT test_result, 'User2 cannot view the conversation';

    -- Test 5: Verify non-participant cannot view the conversation
    SET LOCAL "request.jwt.claim.sub" TO non_participant_id;
    
    SELECT NOT EXISTS (
        SELECT 1 FROM conversations c
        JOIN conversation_participants cp ON cp.conversation_id = c.id
        WHERE c.id = conversation_id
    ) INTO test_result;

    ASSERT test_result, 'Non-participant can view the conversation';

    -- Clean up
    DELETE FROM conversation_participants WHERE conversation_id = conversation_id;
    DELETE FROM conversations WHERE id = conversation_id;
    DELETE FROM profiles WHERE id IN (user1_id, user2_id, user3_id, non_participant_id);
    DELETE FROM auth.users WHERE id IN (user1_id, user2_id, user3_id, non_participant_id);

    RAISE NOTICE 'All tests passed successfully!';
END $$; 