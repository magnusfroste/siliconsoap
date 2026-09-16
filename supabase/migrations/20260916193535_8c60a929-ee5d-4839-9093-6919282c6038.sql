ALTER TABLE public.curated_models ADD COLUMN origin_region text;
ALTER TABLE public.curated_models ADD CONSTRAINT curated_models_origin_region_check CHECK (origin_region IN ('US','CN','EU','OTHER'));

UPDATE public.curated_models SET origin_region = 'CN'
WHERE origin_region IS NULL AND (
  lower(model_id) LIKE 'qwen/%' OR lower(model_id) LIKE 'z-ai/%' OR lower(model_id) LIKE 'deepseek/%'
  OR lower(model_id) LIKE 'minimax/%' OR lower(model_id) LIKE 'stepfun/%' OR lower(model_id) LIKE 'moonshotai/%'
  OR lower(model_id) LIKE 'tencent/%'
);

UPDATE public.curated_models SET origin_region = 'US'
WHERE origin_region IS NULL AND (
  lower(model_id) LIKE 'nvidia/%' OR lower(model_id) LIKE 'x-ai/%' OR lower(model_id) LIKE 'google/%'
  OR lower(model_id) LIKE 'perplexity/%' OR lower(model_id) LIKE 'meta-llama/%' OR lower(model_id) LIKE 'nousresearch/%'
  OR lower(model_id) LIKE 'openai/%' OR lower(model_id) LIKE 'anthropic/%'
);

UPDATE public.curated_models SET origin_region = 'EU'
WHERE origin_region IS NULL AND lower(model_id) LIKE 'mistralai/%';

ALTER TABLE public.agent_chats ADD COLUMN featured_at timestamptz;
CREATE INDEX idx_agent_chats_featured_at ON public.agent_chats (featured_at DESC) WHERE featured_at IS NOT NULL;