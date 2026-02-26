
-- Simplify chat_analytics INSERT: drop conflicting policies, create one unified policy
DROP POLICY IF EXISTS "Anyone can insert analytics" ON public.chat_analytics;
DROP POLICY IF EXISTS "Allow guest analytics inserts" ON public.chat_analytics;

CREATE POLICY "Anyone can insert analytics"
  ON public.chat_analytics
  FOR INSERT
  WITH CHECK (true);

-- Add feature flag for auto-saving guest debates
INSERT INTO public.feature_flags (key, name, description, enabled)
VALUES ('auto_save_guest_debates', 'Auto-save guest debates', 'Automatically save guest debates to the database so they appear on Explore and can be shared', true)
ON CONFLICT (key) DO NOTHING;
