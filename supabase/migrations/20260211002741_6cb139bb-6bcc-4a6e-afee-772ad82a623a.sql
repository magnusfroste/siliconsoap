
-- Add Google Analytics tracking ID feature flag
INSERT INTO public.feature_flags (key, name, description, enabled, text_value)
VALUES ('google_analytics_id', 'Google Analytics Tracking ID', 'GA4 measurement ID (e.g. G-XXXXXXXXXX). Leave empty to use default.', true, 'G-PE12VHGLKQ')
ON CONFLICT (key) DO NOTHING;
