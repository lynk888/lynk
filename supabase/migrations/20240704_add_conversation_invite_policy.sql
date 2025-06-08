-- Drop existing policies
DROP POLICY IF EXISTS "Users can add themselves as participants" ON conversation_participants;

-- Create a new policy that allows users to add themselves to conversations
CREATE POLICY "Users can add themselves to conversations"
ON conversation_participants FOR INSERT
WITH CHECK (
  -- User can only add themselves
  user_id = auth.uid()
  AND
  -- Conversation must exist
  EXISTS (
    SELECT 1 FROM conversations
    WHERE id = conversation_id
  )
); 