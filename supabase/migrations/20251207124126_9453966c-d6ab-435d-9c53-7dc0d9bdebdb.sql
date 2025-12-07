-- Add default_for_agent column to curated_models
ALTER TABLE public.curated_models ADD COLUMN default_for_agent text;

-- Set initial defaults based on current feature flags
UPDATE public.curated_models SET default_for_agent = 'A' WHERE model_id = 'deepseek/deepseek-r1-distill-llama-70b';
UPDATE public.curated_models SET default_for_agent = 'B' WHERE model_id = 'meta-llama/llama-4-maverick';
UPDATE public.curated_models SET default_for_agent = 'C' WHERE model_id = 'qwen/qwen3-next-80b-a3b-instruct';