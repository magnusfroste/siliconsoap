-- Allow admins to delete token usage records (for cleanup)
CREATE POLICY "Admins can delete token usage"
ON public.user_token_usage
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));