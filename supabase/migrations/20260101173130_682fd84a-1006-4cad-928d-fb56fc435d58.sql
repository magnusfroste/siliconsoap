-- Add UPDATE policy so users can update their own analytics records (for completing chats)
CREATE POLICY "Users can update own analytics" 
ON public.chat_analytics 
FOR UPDATE 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Also allow updating by matching session_id for guests
CREATE POLICY "Anyone can update analytics by session" 
ON public.chat_analytics 
FOR UPDATE 
USING (session_id IS NOT NULL);