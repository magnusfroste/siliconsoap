-- Add tokens_per_credit feature flag (100K tokens = 1 credit by default)
INSERT INTO public.feature_flags (key, name, description, enabled, numeric_value)
VALUES (
  'tokens_per_credit',
  'Tokens Per Credit',
  'Number of tokens that equals 1 credit (e.g., 100000 means 100K tokens = 1 credit)',
  true,
  100000
)
ON CONFLICT (key) DO NOTHING;