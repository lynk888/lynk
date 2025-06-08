-- Enable the storage extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "storage" SCHEMA "storage";

-- Create buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars', 'avatars', true),
  ('attachments', 'attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Create policies for the avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid() = (storage.foldername(name))[1]::uuid
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid() = (storage.foldername(name))[1]::uuid
);

-- Create policies for the attachments bucket
CREATE POLICY "Users can upload attachments to their conversations"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'attachments' 
  AND auth.uid() = (storage.foldername(name))[1]::uuid
);

CREATE POLICY "Users can view attachments in their conversations"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'attachments' 
  AND EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = (storage.foldername(name))[2]::uuid
    AND cp.user_id = auth.uid()
  )
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated; 