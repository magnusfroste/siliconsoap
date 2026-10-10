CREATE TABLE public.edge_rate_limits (
  bucket text NOT NULL,
  window_start timestamptz NOT NULL,
  count int NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket, window_start)
);
ALTER TABLE public.edge_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.edge_rate_limits FROM anon, authenticated;
GRANT ALL ON public.edge_rate_limits TO service_role;

CREATE OR REPLACE FUNCTION public.bump_rate_limit(p_bucket text, p_window_seconds int, p_max int)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window timestamptz;
  v_count int;
BEGIN
  v_window := to_timestamp(floor(extract(epoch FROM now()) / p_window_seconds) * p_window_seconds);
  DELETE FROM public.edge_rate_limits WHERE window_start < now() - interval '1 day';
  INSERT INTO public.edge_rate_limits (bucket, window_start, count)
  VALUES (p_bucket, v_window, 1)
  ON CONFLICT (bucket, window_start) DO UPDATE SET count = public.edge_rate_limits.count + 1
  RETURNING count INTO v_count;
  RETURN v_count <= p_max;
END;
$$;
REVOKE ALL ON FUNCTION public.bump_rate_limit(text, int, int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bump_rate_limit(text, int, int) TO service_role;