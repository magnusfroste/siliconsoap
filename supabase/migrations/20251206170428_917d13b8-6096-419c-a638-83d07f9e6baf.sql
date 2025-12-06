-- Create curated_models table for admin-managed model curation
CREATE TABLE public.curated_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  provider TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  is_free BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.curated_models ENABLE ROW LEVEL SECURITY;

-- Anyone can read curated models
CREATE POLICY "Anyone can view curated models"
ON public.curated_models
FOR SELECT
USING (true);

-- Only admins can insert curated models
CREATE POLICY "Admins can insert curated models"
ON public.curated_models
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update curated models
CREATE POLICY "Admins can update curated models"
ON public.curated_models
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete curated models
CREATE POLICY "Admins can delete curated models"
ON public.curated_models
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_curated_models_updated_at
BEFORE UPDATE ON public.curated_models
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with initial recommended models (enabled by default)
INSERT INTO public.curated_models (model_id, display_name, provider, is_enabled, is_free, sort_order) VALUES
  ('meta-llama/llama-3.3-70b-instruct', 'Llama 3.3 70B Instruct', 'Meta', true, true, 1),
  ('deepseek/deepseek-chat-v3-0324', 'DeepSeek Chat v3', 'DeepSeek', true, false, 2),
  ('google/gemma-3-27b-it', 'Gemma 3 27B', 'Google', true, true, 3),
  ('google/gemini-2.5-flash', 'Gemini 2.5 Flash', 'Google', true, false, 4),
  ('qwen/qwen3-30b-a3b', 'Qwen3 30B', 'Qwen', true, true, 5),
  ('anthropic/claude-3.5-sonnet', 'Claude 3.5 Sonnet', 'Anthropic', true, false, 6),
  ('openai/gpt-4o', 'GPT-4o', 'OpenAI', true, false, 7),
  ('mistralai/mistral-large-2411', 'Mistral Large', 'Mistral AI', true, false, 8);