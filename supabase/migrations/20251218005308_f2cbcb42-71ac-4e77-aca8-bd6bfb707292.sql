-- Add view_count column to agent_chats for tracking shared debate views
ALTER TABLE public.agent_chats 
ADD COLUMN view_count integer NOT NULL DEFAULT 0;

-- Create index for efficient querying of public chats
CREATE INDEX idx_agent_chats_public_shared ON public.agent_chats (is_public, share_id, view_count DESC) 
WHERE is_public = true AND share_id IS NOT NULL AND deleted_at IS NULL;

-- Function to increment view count (can be called without auth)
CREATE OR REPLACE FUNCTION public.increment_chat_view_count(p_share_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.agent_chats
  SET view_count = view_count + 1
  WHERE share_id = p_share_id AND is_public = true;
END;
$$;