-- Fix RLS policies for agent_chat_messages to allow public chat viewing
-- The issue is that RESTRICTIVE policies require ALL to pass, we need PERMISSIVE (OR logic)

-- First drop the existing restrictive policies
DROP POLICY IF EXISTS "Anyone can view public chat messages" ON public.agent_chat_messages;
DROP POLICY IF EXISTS "Users can view own chat messages" ON public.agent_chat_messages;

-- Recreate as PERMISSIVE policies (default) so either condition can grant access
CREATE POLICY "Anyone can view public chat messages"
ON public.agent_chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.agent_chats
    WHERE agent_chats.id = agent_chat_messages.chat_id
    AND agent_chats.is_public = true
    AND agent_chats.share_id IS NOT NULL
  )
);

CREATE POLICY "Users can view own chat messages"
ON public.agent_chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.agent_chats
    WHERE agent_chats.id = agent_chat_messages.chat_id
    AND agent_chats.user_id = auth.uid()
  )
);