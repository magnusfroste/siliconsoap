INSERT INTO public.feature_flags (key, name, description, enabled, numeric_value)
VALUES ('guest_daily_call_limit', 'Guest daily call limit', 'Max anonymous shared-key openrouter-chat calls per hashed IP per day (fallback 400).', true, 400)
ON CONFLICT (key) DO NOTHING;