-- Drop existing function if it exists
DROP FUNCTION IF EXISTS add_conversation_participant;

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