-- Create user_token_usage table to track per-call token consumption
CREATE TABLE public.user_token_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_id uuid REFERENCES public.agent_chats(id) ON DELETE SET NULL,
  model_id text NOT NULL,
  prompt_tokens integer NOT NULL DEFAULT 0,
  completion_tokens integer NOT NULL DEFAULT 0,
  total_tokens integer NOT NULL DEFAULT 0,
  estimated_cost numeric(12, 8) NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add token budget to user_credits table
ALTER TABLE public.user_credits 
ADD COLUMN token_budget integer NOT NULL DEFAULT 100000,
ADD COLUMN tokens_used integer NOT NULL DEFAULT 0;

-- Enable RLS
ALTER TABLE public.user_token_usage ENABLE ROW LEVEL SECURITY;

-- Users can view their own token usage
CREATE POLICY "Users can view own token usage"
ON public.user_token_usage
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own token usage (via edge function with service role)
CREATE POLICY "Anyone can insert token usage"
ON public.user_token_usage
FOR INSERT
WITH CHECK (true);

-- Admins can view all token usage
CREATE POLICY "Admins can view all token usage"
ON public.user_token_usage
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to use tokens atomically
CREATE OR REPLACE FUNCTION public.use_tokens(
  p_user_id uuid,
  p_chat_id uuid,
  p_model_id text,
  p_prompt_tokens integer,
  p_completion_tokens integer,
  p_estimated_cost numeric
)
RETURNS TABLE(success boolean, new_tokens_used integer, new_budget_remaining integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_total_tokens integer;
  v_budget integer;
  v_used integer;
BEGIN
  v_total_tokens := p_prompt_tokens + p_completion_tokens;
  
  -- Lock the row and check budget atomically
  SELECT token_budget, tokens_used INTO v_budget, v_used
  FROM public.user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  -- If no record found, create one with default budget
  IF v_budget IS NULL THEN
    INSERT INTO public.user_credits (user_id, credits_remaining, token_budget, tokens_used)
    VALUES (p_user_id, 10, 100000, 0)
    ON CONFLICT (user_id) DO NOTHING;
    
    SELECT token_budget, tokens_used INTO v_budget, v_used
    FROM public.user_credits
    WHERE user_id = p_user_id
    FOR UPDATE;
  END IF;
  
  -- Check if user has budget remaining
  IF (v_used + v_total_tokens) > v_budget THEN
    RETURN QUERY SELECT false::boolean, v_used::integer, (v_budget - v_used)::integer;
    RETURN;
  END IF;
  
  -- Update tokens used
  UPDATE public.user_credits
  SET tokens_used = tokens_used + v_total_tokens,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Log the usage
  INSERT INTO public.user_token_usage (user_id, chat_id, model_id, prompt_tokens, completion_tokens, total_tokens, estimated_cost)
  VALUES (p_user_id, p_chat_id, p_model_id, p_prompt_tokens, p_completion_tokens, v_total_tokens, p_estimated_cost);
  
  RETURN QUERY SELECT true::boolean, (v_used + v_total_tokens)::integer, (v_budget - v_used - v_total_tokens)::integer;
END;
$$;

-- Create index for faster queries
CREATE INDEX idx_user_token_usage_user_id ON public.user_token_usage(user_id);
CREATE INDEX idx_user_token_usage_chat_id ON public.user_token_usage(chat_id);
CREATE INDEX idx_user_token_usage_created_at ON public.user_token_usage(created_at DESC);