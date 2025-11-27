-- Add text_value column to feature_flags for storing string configuration values
ALTER TABLE feature_flags ADD COLUMN IF NOT EXISTS text_value text;