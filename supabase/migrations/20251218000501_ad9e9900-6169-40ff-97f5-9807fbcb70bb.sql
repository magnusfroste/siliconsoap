-- Create reactions table for shared debates
CREATE TABLE public.chat_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  share_id TEXT NOT NULL,
  emoji TEXT NOT NULL CHECK (emoji IN ('fire', 'thinking', 'lightbulb', 'laughing')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Optional: fingerprint to limit spam (browser fingerprint hash)
  visitor_id TEXT
);

-- Index for fast lookups
CREATE INDEX idx_chat_reactions_share_id ON public.chat_reactions(share_id);

-- Enable RLS
ALTER TABLE public.chat_reactions ENABLE ROW LEVEL SECURITY;

-- Anyone can view reaction counts
CREATE POLICY "Anyone can view reactions"
ON public.chat_reactions
FOR SELECT
USING (true);

-- Anyone can add reactions (anonymous)
CREATE POLICY "Anyone can add reactions"
ON public.chat_reactions
FOR INSERT
WITH CHECK (true);

-- Enable realtime for reactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_reactions;