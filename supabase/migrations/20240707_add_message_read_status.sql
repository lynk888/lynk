-- Add read status to messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false;

-- Drop existing blocked_users table if it exists
DROP TABLE IF EXISTS blocked_users;

-- Create blocked_users table with correct column names
CREATE TABLE IF NOT EXISTS blocked_users (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, blocked_user_id)
);

-- Add indexes for blocked_users
CREATE INDEX IF NOT EXISTS idx_blocked_users_user_id ON blocked_users(user_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked_user_id ON blocked_users(blocked_user_id);

-- Enable RLS
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own blocked users"
    ON blocked_users FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can block other users"
    ON blocked_users FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unblock users"
    ON blocked_users FOR DELETE
    USING (user_id = auth.uid());

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS is_user_blocked(uuid, uuid);

-- Create function to check if a user is blocked
CREATE OR REPLACE FUNCTION is_user_blocked(blocker_id UUID, blocked_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM blocked_users
        WHERE blocked_users.user_id = $1
        AND blocked_users.blocked_user_id = $2
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to prevent messages from blocked users
CREATE OR REPLACE FUNCTION prevent_blocked_messages()
RETURNS TRIGGER AS $$
DECLARE
    recipient_id UUID;
BEGIN
    -- Get the recipient's ID from conversation_participants
    SELECT cp.user_id INTO recipient_id
    FROM conversation_participants cp
    WHERE cp.conversation_id = NEW.conversation_id
    AND cp.user_id != NEW.sender_id
    LIMIT 1;

    IF recipient_id IS NOT NULL AND is_user_blocked(recipient_id, NEW.sender_id) THEN
        RAISE EXCEPTION 'Cannot send message to blocked user';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS prevent_blocked_messages_trigger ON messages;
CREATE TRIGGER prevent_blocked_messages_trigger
    BEFORE INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION prevent_blocked_messages();

-- Create trigger to prevent blocked users from being added to conversations
CREATE OR REPLACE FUNCTION prevent_blocked_conversation_participants()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM conversation_participants cp
        WHERE cp.conversation_id = NEW.conversation_id
        AND is_user_blocked(cp.user_id, NEW.user_id)
    ) THEN
        RAISE EXCEPTION 'Cannot add blocked user to conversation';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS prevent_blocked_conversation_participants_trigger ON conversation_participants;
CREATE TRIGGER prevent_blocked_conversation_participants_trigger
    BEFORE INSERT ON conversation_participants
    FOR EACH ROW
    EXECUTE FUNCTION prevent_blocked_conversation_participants(); 