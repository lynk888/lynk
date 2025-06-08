-- Test script for conversation_participants policies

DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    user3_id UUID;
    conversation_id UUID;
BEGIN
    -- Create test users
    INSERT INTO auth.users (id, email)
    VALUES 
        (gen_random_uuid(), 'test1@example.com'),
        (gen_random_uuid(), 'test2@example.com'),
        (gen_random_uuid(), 'test3@example.com')
    RETURNING id INTO user1_id;

    -- Create profiles for the users
    INSERT INTO profiles (id, username, email)
    VALUES 
        (user1_id, 'testuser1', 'test1@example.com'),
        (user2_id, 'testuser2', 'test2@example.com'),
        (user3_id, 'testuser3', 'test3@example.com');

    -- Create a test conversation
    INSERT INTO conversations (id)
    VALUES (gen_random_uuid())
    RETURNING id INTO conversation_id;

    -- Test 1: User1 adds themselves to the conversation
    SET LOCAL ROLE authenticated;
    SET LOCAL "request.jwt.claim.sub" TO user1_id;
    
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES (conversation_id, user1_id);

    -- Test 2: User1 should be able to view their own participant record
    ASSERT EXISTS (
        SELECT 1 FROM conversation_participants
        WHERE conversation_id = conversation_id
        AND user_id = user1_id
    ), 'User1 should be able to view their own participant record';

    -- Test 3: User2 adds themselves to the conversation
    SET LOCAL "request.jwt.claim.sub" TO user2_id;
    
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES (conversation_id, user2_id);

    -- Test 4: User1 should NOT be able to view User2's participant record
    SET LOCAL "request.jwt.claim.sub" TO user1_id;
    
    ASSERT NOT EXISTS (
        SELECT 1 FROM conversation_participants
        WHERE conversation_id = conversation_id
        AND user_id = user2_id
    ), 'User1 should NOT be able to view User2''s participant record';

    -- Test 5: User2 should be able to view their own participant record
    SET LOCAL "request.jwt.claim.sub" TO user2_id;
    
    ASSERT EXISTS (
        SELECT 1 FROM conversation_participants
        WHERE conversation_id = conversation_id
        AND user_id = user2_id
    ), 'User2 should be able to view their own participant record';

    -- Test 6: User1 should NOT be able to add User2 to another conversation
    SET LOCAL "request.jwt.claim.sub" TO user1_id;
    
    BEGIN
        INSERT INTO conversation_participants (conversation_id, user_id)
        VALUES (conversation_id, user2_id);
        ASSERT false, 'User1 should NOT be able to add User2 to conversation';
    EXCEPTION
        WHEN OTHERS THEN
            -- Expected error
            NULL;
    END;

    -- Clean up
    DELETE FROM conversation_participants WHERE conversation_id = conversation_id;
    DELETE FROM conversations WHERE id = conversation_id;
    DELETE FROM profiles WHERE id IN (user1_id, user2_id, user3_id);
    DELETE FROM auth.users WHERE id IN (user1_id, user2_id, user3_id);

    RAISE NOTICE 'All policy tests passed successfully!';
END $$; 