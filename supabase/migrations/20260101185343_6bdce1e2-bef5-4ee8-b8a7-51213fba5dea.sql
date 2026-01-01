-- Allow admins to view all agent_chats for analytics purposes
CREATE POLICY "Admins can view all chats"
ON public.agent_chats
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));