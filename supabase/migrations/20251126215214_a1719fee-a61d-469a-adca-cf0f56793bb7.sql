-- Add soft delete column to agent_chats
ALTER TABLE agent_chats 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Update RLS policy to allow checking shared chat status (including deleted ones)
DROP POLICY IF EXISTS "Anyone can view public chats" ON agent_chats;

CREATE POLICY "Anyone can view public chats" 
ON agent_chats FOR SELECT
USING (
  (is_public = true AND share_id IS NOT NULL) OR 
  (auth.uid() = user_id)
);