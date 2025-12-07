-- Create chat_analytics table to track all chat activity
CREATE TABLE public.chat_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES public.agent_chats(id) ON DELETE CASCADE,
  user_id UUID,
  
  -- Execution metrics
  total_messages INTEGER DEFAULT 0,
  total_tokens_used INTEGER DEFAULT 0,
  estimated_cost DECIMAL(10,6) DEFAULT 0,
  generation_duration_ms INTEGER DEFAULT 0,
  
  -- Context
  is_guest BOOLEAN DEFAULT false,
  user_agent TEXT,
  prompt_preview TEXT,
  scenario_id TEXT,
  models_used TEXT[],
  num_agents INTEGER DEFAULT 2,
  num_rounds INTEGER DEFAULT 2,
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for fast lookups
CREATE INDEX idx_chat_analytics_created_at ON public.chat_analytics(created_at DESC);
CREATE INDEX idx_chat_analytics_chat_id ON public.chat_analytics(chat_id);
CREATE INDEX idx_chat_analytics_user_id ON public.chat_analytics(user_id);

-- Enable RLS
ALTER TABLE public.chat_analytics ENABLE ROW LEVEL SECURITY;

-- Only admins can view analytics
CREATE POLICY "Admins can view all analytics" 
ON public.chat_analytics 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow inserts from authenticated users (for logging their own chats)
CREATE POLICY "Anyone can insert analytics" 
ON public.chat_analytics 
FOR INSERT 
WITH CHECK (true);

-- Allow anonymous inserts for guest tracking
ALTER TABLE public.chat_analytics FORCE ROW LEVEL SECURITY;