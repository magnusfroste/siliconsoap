-- Add requested_model_id column to track fallback scenarios
ALTER TABLE public.user_token_usage 
ADD COLUMN requested_model_id text;

-- Update the use_tokens function to accept and store requested_model_id
CREATE OR REPLACE FUNCTION public.use_tokens(
  p_user_id uuid, 
  p_chat_id uuid, 
  p_model_id text, 
  p_prompt_tokens integer, 
  p_completion_tokens integer, 
  p_estimated_cost numeric,
  p_requested_model_id text DEFAULT NULL
)
RETURNS TABLE(success boolean, new_tokens_used integer, new_budget_remaining integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_total_tokens integer;
  v_budget integer;
  v_used integer;
  v_credits integer;
  v_requested_model text;
BEGIN
  v_total_tokens := p_prompt_tokens + p_completion_tokens;
  -- If no requested model provided, assume it's the same as actual model
  v_requested_model := COALESCE(p_requested_model_id, p_model_id);
  
  -- Lock the row and get current state
  SELECT token_budget, tokens_used, credits_remaining 
  INTO v_budget, v_used, v_credits
  FROM public.user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  -- If no record found, create one
  IF v_budget IS NULL THEN
    INSERT INTO public.user_credits (user_id, credits_remaining, token_budget, tokens_used)
    VALUES (p_user_id, 10, 100000, 0)
    ON CONFLICT (user_id) DO NOTHING;
    
    SELECT token_budget, tokens_used, credits_remaining 
    INTO v_budget, v_used, v_credits
    FROM public.user_credits
    WHERE user_id = p_user_id
    FOR UPDATE;
  END IF;
  
  -- Check if adding tokens would exceed budget
  IF (v_used + v_total_tokens) > v_budget THEN
    -- Check if user has credits to spend
    IF v_credits > 0 THEN
      -- Deduct 1 credit and reset token bucket
      UPDATE public.user_credits
      SET credits_remaining = credits_remaining - 1,
          credits_used = credits_used + 1,
          tokens_used = v_total_tokens,
          updated_at = now()
      WHERE user_id = p_user_id;
      
      -- Log the usage with requested model
      INSERT INTO public.user_token_usage (user_id, chat_id, model_id, prompt_tokens, completion_tokens, total_tokens, estimated_cost, requested_model_id)
      VALUES (p_user_id, p_chat_id, p_model_id, p_prompt_tokens, p_completion_tokens, v_total_tokens, p_estimated_cost, v_requested_model);
      
      RETURN QUERY SELECT true::boolean, v_total_tokens::integer, (v_budget - v_total_tokens)::integer;
      RETURN;
    ELSE
      -- No credits left - block the request
      RETURN QUERY SELECT false::boolean, v_used::integer, (v_budget - v_used)::integer;
      RETURN;
    END IF;
  END IF;
  
  -- Normal case: add tokens to current bucket
  UPDATE public.user_credits
  SET tokens_used = tokens_used + v_total_tokens,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Log the usage with requested model
  INSERT INTO public.user_token_usage (user_id, chat_id, model_id, prompt_tokens, completion_tokens, total_tokens, estimated_cost, requested_model_id)
  VALUES (p_user_id, p_chat_id, p_model_id, p_prompt_tokens, p_completion_tokens, v_total_tokens, p_estimated_cost, v_requested_model);
  
  RETURN QUERY SELECT true::boolean, (v_used + v_total_tokens)::integer, (v_budget - v_used - v_total_tokens)::integer;
END;
$function$;