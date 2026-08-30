CREATE TABLE public.learn_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tab text NOT NULL CHECK (tab IN ('models','privacy','local','agents','glossary')),
  slug text NOT NULL UNIQUE,
  kind text NOT NULL DEFAULT 'note' CHECK (kind IN ('note','callout','term','section','link')),
  title text NOT NULL,
  body text NOT NULL,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  position integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','published')),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by_label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.learn_blocks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learn_blocks TO authenticated;
GRANT ALL ON public.learn_blocks TO service_role;

ALTER TABLE public.learn_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published learn blocks are public"
  ON public.learn_blocks FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can read all learn blocks"
  ON public.learn_blocks FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert learn blocks"
  ON public.learn_blocks FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update learn blocks"
  ON public.learn_blocks FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete learn blocks"
  ON public.learn_blocks FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER learn_blocks_set_updated_at
  BEFORE UPDATE ON public.learn_blocks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX learn_blocks_tab_status_idx ON public.learn_blocks (tab, status, position);