-- Create atomic credit deduction function to prevent race conditions
CREATE OR REPLACE FUNCTION public.use_credit(p_user_id uuid)
RETURNS TABLE(success boolean, new_remaining integer, new_used integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_remaining integer;
  v_used integer;
BEGIN
  -- Lock the row and check credits atomically
  SELECT credits_remaining, credits_used INTO v_remaining, v_used
  FROM public.user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  -- If no record found
  IF v_remaining IS NULL THEN
    RETURN QUERY SELECT false::boolean, 0::integer, 0::integer;
    RETURN;
  END IF;
  
  -- If no credits remaining
  IF v_remaining <= 0 THEN
    RETURN QUERY SELECT false::boolean, v_remaining::integer, v_used::integer;
    RETURN;
  END IF;
  
  -- Deduct credit atomically
  UPDATE public.user_credits
  SET credits_remaining = credits_remaining - 1,
      credits_used = credits_used + 1,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN QUERY SELECT true::boolean, (v_remaining - 1)::integer, (v_used + 1)::integer;
END;
$$;