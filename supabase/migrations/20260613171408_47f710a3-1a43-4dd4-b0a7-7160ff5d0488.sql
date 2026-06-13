
-- 1. Remove plaintext API key storage
ALTER TABLE public.api_keys DROP COLUMN IF EXISTS key_plaintext;

-- 2. chat_analytics: remove user SELECT (only admins read) — eliminates IP/session exposure to owners
DROP POLICY IF EXISTS "Users can view own analytics" ON public.chat_analytics;
DROP POLICY IF EXISTS "Users can update own analytics" ON public.chat_analytics;

-- 3. chat_analytics: replace permissive insert with tighter policy
DROP POLICY IF EXISTS "Anyone can insert analytics" ON public.chat_analytics;
CREATE POLICY "Insert analytics for self or guest"
ON public.chat_analytics
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (is_guest = true AND user_id IS NULL)
  OR (auth.uid() IS NOT NULL AND auth.uid() = user_id)
);

-- 3b. Trigger to prevent clients from setting server-only PII fields
CREATE OR REPLACE FUNCTION public.chat_analytics_strip_server_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  -- Only service_role/postgres are allowed to set IP / country / session
  IF current_setting('role', true) NOT IN ('service_role', 'postgres') THEN
    NEW.ip_address := NULL;
    NEW.country_code := NULL;
    NEW.session_id := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS chat_analytics_strip_pii ON public.chat_analytics;
CREATE TRIGGER chat_analytics_strip_pii
  BEFORE INSERT OR UPDATE ON public.chat_analytics
  FOR EACH ROW EXECUTE FUNCTION public.chat_analytics_strip_server_fields();

-- 4. user_token_usage: drop permissive insert (use_tokens RPC handles inserts via SECURITY DEFINER)
DROP POLICY IF EXISTS "Anyone can insert token usage" ON public.user_token_usage;

-- 5. Revoke execute on internal trigger/helper functions from client roles
REVOKE EXECUTE ON FUNCTION public.handle_new_user_credits() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_profile() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.chat_analytics_strip_server_fields() FROM anon, authenticated;
