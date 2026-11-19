CREATE TABLE public.credit_purchases (
  stripe_session_id text PRIMARY KEY,
  user_id uuid NOT NULL,
  credits integer NOT NULL,
  amount_total integer,
  currency text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.credit_purchases TO service_role;
ALTER TABLE public.credit_purchases ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.grant_purchased_credits(
  p_session_id text, p_user_id uuid, p_credits integer, p_amount_total integer, p_currency text
) RETURNS TABLE(granted boolean, new_balance integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_inserted integer; v_balance integer;
BEGIN
  IF p_session_id IS NULL OR p_user_id IS NULL OR coalesce(p_credits, 0) <= 0 THEN
    RAISE EXCEPTION 'Invalid purchase' USING ERRCODE = '22023';
  END IF;
  INSERT INTO public.credit_purchases(stripe_session_id, user_id, credits, amount_total, currency)
  VALUES (p_session_id, p_user_id, p_credits, p_amount_total, p_currency)
  ON CONFLICT (stripe_session_id) DO NOTHING;
  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  IF v_inserted = 1 THEN
    INSERT INTO public.user_credits(user_id, credits_remaining, credits_used)
    VALUES (p_user_id, p_credits, 0)
    ON CONFLICT (user_id) DO UPDATE
      SET credits_remaining = public.user_credits.credits_remaining + EXCLUDED.credits_remaining,
          updated_at = now()
    RETURNING credits_remaining INTO v_balance;
    RETURN QUERY SELECT true, v_balance;
  ELSE
    SELECT credits_remaining INTO v_balance FROM public.user_credits WHERE user_id = p_user_id;
    RETURN QUERY SELECT false, v_balance;
  END IF;
END $$;
REVOKE ALL ON FUNCTION public.grant_purchased_credits(text, uuid, integer, integer, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grant_purchased_credits(text, uuid, integer, integer, text) TO service_role;