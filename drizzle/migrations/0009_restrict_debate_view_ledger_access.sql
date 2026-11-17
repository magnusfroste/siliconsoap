REVOKE ALL ON TABLE public.debate_views FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.debate_views TO service_role;