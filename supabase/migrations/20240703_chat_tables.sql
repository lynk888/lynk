-- Create UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  last_message_text TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE
);

-- Conversation participants
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_read_at CHECK (read_at IS NULL OR read_at >= created_at)
);

-- Message status table (for read receipts)
CREATE TABLE IF NOT EXISTS message_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id),
  CONSTRAINT valid_read_status CHECK (
    (is_read = FALSE AND read_at IS NULL) OR
    (is_read = TRUE AND read_at IS NOT NULL)
  )
);

-- Contacts table (for user relationships)
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, contact_id),
  CONSTRAINT no_self_contact CHECK (user_id != contact_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id_created_at ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_message_status_message_id ON message_status(message_id);
CREATE INDEX IF NOT EXISTS idx_message_status_user_id ON message_status(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view any profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can view any profile"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Conversations Policies
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;

CREATE POLICY "Users can view their conversations"
ON conversations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create conversations"
ON conversations FOR INSERT
WITH CHECK (true);

-- Conversation Participants Policies
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can add participants" ON conversation_participants;

CREATE POLICY "Users can view participants in their conversations"
ON conversation_participants FOR SELECT
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = conversation_participants.conversation_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can add participants"
ON conversation_participants FOR INSERT
WITH CHECK (true);

-- Messages Policies
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON messages;

CREATE POLICY "Users can view messages in their conversations"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = messages.conversation_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages to their conversations"
ON messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = messages.conversation_id
    AND user_id = auth.uid()
  )
);

-- Message Status Policies
DROP POLICY IF EXISTS "Users can view message status in their conversations" ON message_status;
DROP POLICY IF EXISTS "Users can insert their own message status" ON message_status;
DROP POLICY IF EXISTS "Users can update their own message status" ON message_status;

CREATE POLICY "Users can view message status in their conversations"
ON message_status FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM messages
    JOIN conversation_participants ON messages.conversation_id = conversation_participants.conversation_id
    WHERE messages.id = message_status.message_id
    AND conversation_participants.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own message status"
ON message_status FOR INSERT
WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "Users can update their own message status"
ON message_status FOR UPDATE
USING (
  user_id = auth.uid()
);

-- Contacts Policies
DROP POLICY IF EXISTS "Users can view their contacts" ON contacts;
DROP POLICY IF EXISTS "Users can add contacts" ON contacts;
DROP POLICY IF EXISTS "Users can update their contacts" ON contacts;

CREATE POLICY "Users can view their contacts"
ON contacts FOR SELECT
USING (
  user_id = auth.uid()
);

CREATE POLICY "Users can add contacts"
ON contacts FOR INSERT
WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "Users can update their contacts"
ON contacts FOR UPDATE
USING (
  user_id = auth.uid()
);

-- Function to update conversation's last message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET
    last_message_id = NEW.id,
    last_message_text = NEW.content,
    last_message_time = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_message_inserted ON messages;

-- Trigger to update conversation when a new message is inserted
CREATE TRIGGER on_message_inserted
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Function to search users by username
CREATE OR REPLACE FUNCTION search_users(search_term TEXT)
RETURNS TABLE (
    id UUID,
    username TEXT,
    avatar_url TEXT,
    email TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.username,
        p.avatar_url,
        p.email
    FROM profiles p
    WHERE 
        p.username ILIKE '%' || search_term || '%'
    ORDER BY 
        CASE 
            WHEN p.username ILIKE search_term || '%' THEN 1
            WHEN p.username ILIKE '%' || search_term || '%' THEN 2
            ELSE 3
        END,
        p.username
    LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Policy to allow users to search other users
DROP POLICY IF EXISTS "Users can search other users" ON profiles;
CREATE POLICY "Users can search other users"
ON profiles FOR SELECT
USING (true);