-- Add RLS policy to allow guest users to insert chat analytics
CREATE POLICY "Allow guest analytics inserts"
ON public.chat_analytics
FOR INSERT
WITH CHECK (
  -- Allow inserts where user_id is null (guest) and is_guest is true
  (user_id IS NULL AND is_guest = true)
  -- OR allow authenticated users to insert their own analytics
  OR (auth.uid() = user_id)
);