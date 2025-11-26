-- Enable realtime for agent_chats table
ALTER TABLE public.agent_chats REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_chats;