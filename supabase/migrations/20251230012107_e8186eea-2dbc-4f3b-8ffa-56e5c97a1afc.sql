-- Add pricing columns to curated_models table
ALTER TABLE public.curated_models 
ADD COLUMN IF NOT EXISTS price_input numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS price_output numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS price_tier text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS pricing_updated_at timestamp with time zone DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.curated_models.price_input IS 'Price per input token from OpenRouter (in dollars)';
COMMENT ON COLUMN public.curated_models.price_output IS 'Price per output token from OpenRouter (in dollars)';
COMMENT ON COLUMN public.curated_models.price_tier IS 'Price tier: free, budget, standard, premium, elite';
COMMENT ON COLUMN public.curated_models.pricing_updated_at IS 'Last time pricing was synced from OpenRouter';