-- Add numeric_value column to feature_flags for storing numbers
ALTER TABLE public.feature_flags
ADD COLUMN numeric_value integer;

-- Insert feature flag for free credits amount
INSERT INTO public.feature_flags (key, name, description, enabled, numeric_value)
VALUES (
  'free_credits_amount',
  'Free Credits Amount',
  'Number of free credits given to new users on signup',
  true,
  10
);

-- Update handle_new_user_credits to read from feature flag
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  credits_amount integer;
BEGIN
  -- Get the free credits amount from feature flags
  SELECT COALESCE(numeric_value, 10) INTO credits_amount
  FROM public.feature_flags
  WHERE key = 'free_credits_amount' AND enabled = true
  LIMIT 1;
  
  -- If no flag found, default to 10
  IF credits_amount IS NULL THEN
    credits_amount := 10;
  END IF;
  
  INSERT INTO public.user_credits (user_id, credits_remaining)
  VALUES (new.id, credits_amount);
  
  RETURN new;
END;
$function$;