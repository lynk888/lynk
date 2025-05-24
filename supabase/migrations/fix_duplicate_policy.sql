-- Fix for duplicate policy error
-- Run this if you've already executed the main migration script and encountered the error:
-- "42710: policy "Users can update their own message status" for table "message_status" already exists"

-- First, drop the existing policy
DROP POLICY IF EXISTS "Users can update their own message status" ON message_status;

-- Then create the two policies with unique names
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
