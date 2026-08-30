-- 1. Immutable agent activity log
CREATE TABLE public.agent_activity_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_label text,
  client_id text,
  source text NOT NULL DEFAULT 'mcp',
  tool_name text NOT NULL,
  target_type text,
  target_id text,
  action text NOT NULL DEFAULT 'write',
  success boolean NOT NULL DEFAULT true,
  error_message text,
  input jsonb NOT NULL DEFAULT '{}'::jsonb,
  result jsonb NOT NULL DEFAULT '{}'::jsonb,
  duration_ms integer,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_activity_log_created_at ON public.agent_activity_log (created_at DESC);
CREATE INDEX idx_agent_activity_log_tool ON public.agent_activity_log (tool_name);
CREATE INDEX idx_agent_activity_log_actor ON public.agent_activity_log (actor_user_id);

GRANT SELECT, INSERT ON public.agent_activity_log TO authenticated;
GRANT ALL ON public.agent_activity_log TO service_role;

ALTER TABLE public.agent_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can log own agent activity"
  ON public.agent_activity_log FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = actor_user_id);

CREATE POLICY "Users can view own agent activity"
  ON public.agent_activity_log FOR SELECT TO authenticated
  USING (auth.uid() = actor_user_id);

CREATE POLICY "Admins can view all agent activity"
  ON public.agent_activity_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Append-only: block any UPDATE/DELETE even for privileged roles
CREATE OR REPLACE FUNCTION public.agent_activity_log_immutable()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'agent_activity_log is append-only';
END;
$$;

CREATE TRIGGER agent_activity_log_no_update
  BEFORE UPDATE ON public.agent_activity_log
  FOR EACH ROW EXECUTE FUNCTION public.agent_activity_log_immutable();

CREATE TRIGGER agent_activity_log_no_delete
  BEFORE DELETE ON public.agent_activity_log
  FOR EACH ROW EXECUTE FUNCTION public.agent_activity_log_immutable();

-- 2. Content drafts written by agents
CREATE TABLE public.content_drafts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_label text,
  kind text NOT NULL DEFAULT 'blog_post',
  title text NOT NULL,
  summary text,
  body text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}'::text[],
  source_chat_ids uuid[] NOT NULL DEFAULT '{}'::uuid[],
  status text NOT NULL DEFAULT 'draft',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_drafts_status ON public.content_drafts (status, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_drafts TO authenticated;
GRANT SELECT ON public.content_drafts TO anon;
GRANT ALL ON public.content_drafts TO service_role;

ALTER TABLE public.content_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published drafts"
  ON public.content_drafts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can view all drafts"
  ON public.content_drafts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert drafts"
  ON public.content_drafts FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update drafts"
  ON public.content_drafts FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete drafts"
  ON public.content_drafts FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_content_drafts_updated_at
  BEFORE UPDATE ON public.content_drafts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();