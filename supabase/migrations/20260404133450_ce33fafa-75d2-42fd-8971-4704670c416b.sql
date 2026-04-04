
-- 1. Remove the dangerous user_credits UPDATE policy
DROP POLICY IF EXISTS "Users can update own credits" ON public.user_credits;

-- 2. Remove the overly permissive chat_analytics UPDATE policies
DROP POLICY IF EXISTS "Anyone can update analytics by session" ON public.chat_analytics;
DROP POLICY IF EXISTS "Users can update own analytics" ON public.chat_analytics;

-- 3. Restrict chat_analytics UPDATE to own data only (authenticated user_id match)
CREATE POLICY "Users can update own analytics"
ON public.chat_analytics
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- 4. Remove the overly permissive hall_of_shame INSERT policy
DROP POLICY IF EXISTS "Service role can insert shame moments" ON public.hall_of_shame;

-- 5. Restrict hall_of_shame INSERT to service_role only
CREATE POLICY "Service role can insert shame moments"
ON public.hall_of_shame
FOR INSERT
TO service_role
WITH CHECK (true);
