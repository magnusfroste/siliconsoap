-- Add share functionality columns to agent_chats
ALTER TABLE agent_chats 
ADD COLUMN share_id TEXT UNIQUE,
ADD COLUMN is_public BOOLEAN DEFAULT false;

-- Create index for faster lookups by share_id
CREATE INDEX idx_agent_chats_share_id ON agent_chats(share_id) WHERE share_id IS NOT NULL;

-- RLS policy: Anyone can view public chats
CREATE POLICY "Anyone can view public chats" 
ON agent_chats FOR SELECT 
USING (is_public = true);

-- RLS policy: Anyone can view public chat messages
CREATE POLICY "Anyone can view public chat messages" 
ON agent_chat_messages FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM agent_chats 
    WHERE agent_chats.id = agent_chat_messages.chat_id 
    AND agent_chats.is_public = true
  )
);