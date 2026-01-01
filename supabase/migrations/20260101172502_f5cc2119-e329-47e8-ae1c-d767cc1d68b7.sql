-- Add policy to allow users to view their own analytics records
-- This is needed because logChatStart does .select('id').single() after insert
CREATE POLICY "Users can view own analytics" 
ON public.chat_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

-- Also add policy to allow inserting user's own analytics (more restrictive than current)
-- Current "Anyone can insert analytics" is too permissive but we'll keep it for backwards compat
-- The issue is the SELECT after INSERT fails