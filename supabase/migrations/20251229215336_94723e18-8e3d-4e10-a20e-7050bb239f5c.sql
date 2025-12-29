-- Add license_type column to curated_models to distinguish open-weight vs closed models
ALTER TABLE public.curated_models 
ADD COLUMN license_type TEXT DEFAULT 'closed' CHECK (license_type IN ('open-weight', 'closed'));

-- Add comment for clarity
COMMENT ON COLUMN public.curated_models.license_type IS 'Model license type: open-weight (can be self-hosted) or closed (cloud API only)';