-- Add session tracking for guests and IP logging
ALTER TABLE public.chat_analytics 
ADD COLUMN IF NOT EXISTS session_id TEXT,
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS country_code TEXT;

-- Make chat_id nullable (already is) and don't require UUID for guests
-- We'll use session_id for guest tracking instead

-- Add index for session lookups
CREATE INDEX IF NOT EXISTS idx_chat_analytics_session_id ON public.chat_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_analytics_is_guest ON public.chat_analytics(is_guest);

-- Add comment for documentation
COMMENT ON COLUMN public.chat_analytics.session_id IS 'Browser session ID for tracking guest users';
COMMENT ON COLUMN public.chat_analytics.ip_address IS 'IP address captured from edge function calls';
COMMENT ON COLUMN public.chat_analytics.country_code IS 'Country code derived from IP (e.g., US, SE)';