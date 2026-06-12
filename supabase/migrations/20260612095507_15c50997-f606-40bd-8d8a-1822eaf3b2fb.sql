INSERT INTO public.feature_flags (key, name, enabled, description)
VALUES ('enable_judge_bot', 'Enable Judge Bot', true, 'Toggle the Judge Bot (verdict/analysis) feature for all users. Turn off to hide it entirely.')
ON CONFLICT (key) DO NOTHING;