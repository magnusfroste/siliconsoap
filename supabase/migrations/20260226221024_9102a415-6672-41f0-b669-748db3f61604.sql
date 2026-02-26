
CREATE TABLE public.quick_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  scenario_id text NOT NULL DEFAULT 'general-problem',
  is_enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.quick_prompts ENABLE ROW LEVEL SECURITY;

-- Anyone can view enabled prompts (for frontend)
CREATE POLICY "Anyone can view enabled prompts" ON public.quick_prompts
  FOR SELECT USING (is_enabled = true);

-- Admins can view all prompts (including disabled)
CREATE POLICY "Admins can view all prompts" ON public.quick_prompts
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert prompts
CREATE POLICY "Admins can insert prompts" ON public.quick_prompts
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can update prompts
CREATE POLICY "Admins can update prompts" ON public.quick_prompts
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete prompts
CREATE POLICY "Admins can delete prompts" ON public.quick_prompts
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_quick_prompts_updated_at
  BEFORE UPDATE ON public.quick_prompts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
