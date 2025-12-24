-- Create table for storing Hall of Shame moments from analyses
CREATE TABLE public.hall_of_shame (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES public.agent_chats(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  quote TEXT NOT NULL,
  shame_type TEXT NOT NULL DEFAULT 'backstab', -- backstab, diva, trust_issue
  context TEXT,
  share_id TEXT,
  severity INTEGER DEFAULT 3, -- 1-5 scale
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hall_of_shame ENABLE ROW LEVEL SECURITY;

-- Anyone can view shame moments (they're from public analyses or anonymized)
CREATE POLICY "Anyone can view hall of shame"
ON public.hall_of_shame
FOR SELECT
USING (true);

-- System can insert shame moments (via edge function)
CREATE POLICY "Service role can insert shame moments"
ON public.hall_of_shame
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_hall_of_shame_created_at ON public.hall_of_shame(created_at DESC);
CREATE INDEX idx_hall_of_shame_shame_type ON public.hall_of_shame(shame_type);