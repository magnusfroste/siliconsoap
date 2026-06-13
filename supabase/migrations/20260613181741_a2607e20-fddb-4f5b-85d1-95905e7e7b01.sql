
-- 1. Remove direct INSERT on user_credits (only trigger/service_role should create rows)
DROP POLICY IF EXISTS "Users can insert own credits" ON public.user_credits;

-- 2. Soft-deleted public chats must not be publicly readable
DROP POLICY IF EXISTS "Anyone can view public chats" ON public.agent_chats;
CREATE POLICY "Anyone can view public chats"
  ON public.agent_chats
  FOR SELECT
  USING (
    (((is_public = true) AND (share_id IS NOT NULL)) OR (auth.uid() = user_id))
    AND deleted_at IS NULL
  );

-- Also exclude messages from soft-deleted public chats
DROP POLICY IF EXISTS "Anyone can view public chat messages" ON public.agent_chat_messages;
CREATE POLICY "Anyone can view public chat messages"
  ON public.agent_chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.agent_chats
      WHERE agent_chats.id = agent_chat_messages.chat_id
        AND agent_chats.is_public = true
        AND agent_chats.share_id IS NOT NULL
        AND agent_chats.deleted_at IS NULL
    )
  );

-- 3. Defense-in-depth: ensure the strip trigger actually fires on chat_analytics inserts
DROP TRIGGER IF EXISTS chat_analytics_strip_server_fields_trigger ON public.chat_analytics;
CREATE TRIGGER chat_analytics_strip_server_fields_trigger
  BEFORE INSERT OR UPDATE ON public.chat_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.chat_analytics_strip_server_fields();

-- 4. Tighten chat_reactions INSERT — require the share_id to belong to a public, non-deleted chat
DROP POLICY IF EXISTS "Anyone can add reactions" ON public.chat_reactions;
CREATE POLICY "Anyone can add reactions"
  ON public.chat_reactions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.agent_chats
      WHERE agent_chats.share_id = chat_reactions.share_id
        AND agent_chats.is_public = true
        AND agent_chats.deleted_at IS NULL
    )
  );
