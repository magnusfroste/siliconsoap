-- Extend curated_models table with educational content columns
ALTER TABLE public.curated_models ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.curated_models ADD COLUMN IF NOT EXISTS pros TEXT[];
ALTER TABLE public.curated_models ADD COLUMN IF NOT EXISTS cons TEXT[];
ALTER TABLE public.curated_models ADD COLUMN IF NOT EXISTS use_cases TEXT[];
ALTER TABLE public.curated_models ADD COLUMN IF NOT EXISTS avoid_cases TEXT[];
ALTER TABLE public.curated_models ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.curated_models ADD COLUMN IF NOT EXISTS context_window INTEGER;
ALTER TABLE public.curated_models ADD COLUMN IF NOT EXISTS speed_rating TEXT;