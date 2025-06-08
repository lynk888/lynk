-- Drop all existing policies for conversation_participants
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can add participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view their own participant records" ON conversation_participants;
DROP POLICY IF EXISTS "Users can add themselves as participants" ON conversation_participants;

-- Create a simple SELECT policy that only allows users to view their own records
CREATE POLICY "Users can view their own participant records"
ON conversation_participants FOR SELECT
USING (user_id = auth.uid());

-- Create a simple INSERT policy that only allows users to add themselves
CREATE POLICY "Users can add themselves as participants"
ON conversation_participants FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Add an index to improve performance
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id 
ON conversation_participants(user_id);

-- Add a function to check if a user is a participant in a conversation
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

-- Add a function to get conversation participants
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