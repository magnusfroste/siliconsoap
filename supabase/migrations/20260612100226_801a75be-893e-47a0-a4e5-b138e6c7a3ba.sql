INSERT INTO public.feature_flags (key, name, description, enabled, text_value)
VALUES (
  'default_judge_model',
  'Default Judge/Verdict Model',
  'OpenRouter model ID used by Judge Bot for verdict analysis. Use a paid model to avoid free-tier rate limits (e.g. google/gemini-2.5-flash, openai/gpt-4o-mini, meta-llama/llama-3.3-70b-instruct).',
  true,
  'google/gemini-2.5-flash'
)
ON CONFLICT (key) DO NOTHING;