-- Create a bucket for chat attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat_attachments', 'chat_attachments', false);

-- Set up RLS policies for the bucket
CREATE POLICY "Users can upload their own attachments" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'chat_attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view attachments from their conversations" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'chat_attachments' AND 
       EXISTS (
         SELECT 1 FROM messages m
         JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
         WHERE m.attachment_url = name AND cp.user_id = auth.uid()
       ));