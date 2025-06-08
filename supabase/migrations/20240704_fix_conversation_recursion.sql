-- First, disable RLS temporarily to clean up
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can add participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view their own participant records" ON conversation_participants;
DROP POLICY IF EXISTS "Users can add themselves as participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversation_participants;

-- Drop all existing functions
DROP FUNCTION IF EXISTS add_conversation_participant;
DROP FUNCTION IF EXISTS create_conversation_with_participants;
DROP FUNCTION IF EXISTS is_conversation_participant;
DROP FUNCTION IF EXISTS get_conversation_participants;

-- Create a function to check if a user is a participant in a conversation
CREATE OR REPLACE FUNCTION is_conversation_participant(conversation_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = $1
    AND conversation_participants.user_id = $2
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to safely add a participant to a conversation
CREATE OR REPLACE FUNCTION add_conversation_participant(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Check if the user is already a participant
  IF NOT EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = p_conversation_id
    AND user_id = p_user_id
  ) THEN
    -- Add the participant
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES (p_conversation_id, p_user_id);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to create a conversation with initial participants
CREATE OR REPLACE FUNCTION create_conversation_with_participants(
  p_creator_id UUID,
  p_participant_ids UUID[]
)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
BEGIN
  -- Create the conversation
  INSERT INTO conversations (created_at, updated_at)
  VALUES (NOW(), NOW())
  RETURNING id INTO v_conversation_id;

  -- Add the creator as a participant
  PERFORM add_conversation_participant(v_conversation_id, p_creator_id);

  -- Add other participants
  FOR i IN 1..array_length(p_participant_ids, 1) LOOP
    IF p_participant_ids[i] != p_creator_id THEN
      PERFORM add_conversation_participant(v_conversation_id, p_participant_ids[i]);
    END IF;
  END LOOP;

  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get conversation participants
CREATE OR REPLACE FUNCTION get_conversation_participants(conversation_id UUID)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  avatar_url TEXT
) AS $$
BEGIN
  -- First check if the current user is a participant
  IF NOT is_conversation_participant(conversation_id, auth.uid()) THEN
    RETURN;
  END IF;

  -- If they are, return all participants
  RETURN QUERY
  SELECT 
    cp.user_id,
    p.username,
    p.avatar_url
  FROM conversation_participants cp
  JOIN profiles p ON p.id = cp.user_id
  WHERE cp.conversation_id = $1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-enable RLS
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policies that don't cause recursion
CREATE POLICY "Users can view their own participant records"
ON conversation_participants FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can add themselves as participants"
ON conversation_participants FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id 
ON conversation_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_user 
ON conversation_participants(conversation_id, user_id);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION add_conversation_participant TO authenticated;
GRANT EXECUTE ON FUNCTION create_conversation_with_participants TO authenticated;
GRANT EXECUTE ON FUNCTION get_conversation_participants TO authenticated;
GRANT EXECUTE ON FUNCTION is_conversation_participant TO authenticated; 