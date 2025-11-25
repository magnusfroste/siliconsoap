-- Create agent_chats table for storing chat sessions
CREATE TABLE agent_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Chat',
  scenario_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for agent_chats
ALTER TABLE agent_chats ENABLE ROW LEVEL SECURITY;

-- Users can view their own chats
CREATE POLICY "Users can view own chats" ON agent_chats
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own chats
CREATE POLICY "Users can insert own chats" ON agent_chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own chats
CREATE POLICY "Users can update own chats" ON agent_chats
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own chats
CREATE POLICY "Users can delete own chats" ON agent_chats
  FOR DELETE USING (auth.uid() = user_id);

-- Create agent_chat_messages table for storing conversation messages
CREATE TABLE agent_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES agent_chats(id) ON DELETE CASCADE NOT NULL,
  agent TEXT NOT NULL,
  message TEXT NOT NULL,
  model TEXT NOT NULL,
  persona TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for agent_chat_messages
ALTER TABLE agent_chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages for their own chats
CREATE POLICY "Users can view own chat messages" ON agent_chat_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM agent_chats WHERE id = chat_id AND user_id = auth.uid())
  );

-- Users can insert messages for their own chats
CREATE POLICY "Users can insert own chat messages" ON agent_chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM agent_chats WHERE id = chat_id AND user_id = auth.uid())
  );

-- Create index for better query performance
CREATE INDEX idx_agent_chats_user_id ON agent_chats(user_id);
CREATE INDEX idx_agent_chat_messages_chat_id ON agent_chat_messages(chat_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_agent_chats_updated_at
  BEFORE UPDATE ON agent_chats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();