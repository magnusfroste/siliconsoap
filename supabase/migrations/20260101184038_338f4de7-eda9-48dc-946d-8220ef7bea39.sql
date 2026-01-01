-- Create a function to get user email for admins only
CREATE OR REPLACE FUNCTION public.get_user_email(p_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN public.has_role(auth.uid(), 'admin') THEN 
        (SELECT email FROM auth.users WHERE id = p_user_id)
      ELSE NULL
    END
$$;