-- Add performance optimizations and indexes for conversation-related tables

-- Add index for conversation_participants composite key
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_user 
ON conversation_participants(conversation_id, user_id);

-- Add index for conversation last_message_time for sorting
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_time 
ON conversations(last_message_time DESC NULLS LAST);

-- Add index for conversation updated_at for sorting
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at 
ON conversations(updated_at DESC);

-- Add index for messages conversation_id and created_at for efficient message retrieval
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
ON messages(conversation_id, created_at DESC);

-- Add index for message_status composite key
CREATE INDEX IF NOT EXISTS idx_message_status_message_user 
ON message_status(message_id, user_id);

-- Add index for profiles username for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username 
ON profiles(username);

-- Add index for profiles email for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email 
ON profiles(email);

-- Add index for contacts composite key
CREATE INDEX IF NOT EXISTS idx_contacts_user_contact 
ON contacts(user_id, contact_id);

-- Add index for contacts contact_id for reverse lookups
CREATE INDEX IF NOT EXISTS idx_contacts_contact_id 
ON contacts(contact_id);

-- Add statistics for better query planning
ANALYZE conversation_participants;
ANALYZE conversations;
ANALYZE messages;
ANALYZE message_status;
ANALYZE profiles;
ANALYZE contacts; 