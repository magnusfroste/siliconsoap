-- Allow admins to view all user credits
CREATE POLICY "Admins can view all user credits"
ON public.user_credits
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all user profiles
CREATE POLICY "Admins can view all user profiles"
ON public.user_profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));