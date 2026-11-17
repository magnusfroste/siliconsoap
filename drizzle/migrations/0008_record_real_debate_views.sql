ALTER TABLE public.agent_chats ADD COLUMN real_view_count integer NOT NULL DEFAULT 0;

CREATE TABLE public.debate_views (
  chat_id uuid REFERENCES public.agent_chats(id) ON DELETE CASCADE,
  visitor_key text NOT NULL,
  viewed_on date NOT NULL DEFAULT current_date,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (chat_id, visitor_key, viewed_on)
);
GRANT ALL ON public.debate_views TO service_role;
ALTER TABLE public.debate_views ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.protect_real_debate_views()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $function$
BEGIN
  IF current_user IN ('anon', 'authenticated') THEN
    IF TG_OP = 'INSERT' THEN NEW.real_view_count := 0;
    ELSE NEW.real_view_count := OLD.real_view_count;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;
CREATE TRIGGER protect_real_debate_views BEFORE INSERT OR UPDATE ON public.agent_chats
FOR EACH ROW EXECUTE FUNCTION public.protect_real_debate_views();

CREATE OR REPLACE FUNCTION public.record_debate_view(p_share_id text, p_visitor_key text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $function$
DECLARE
  v_chat_id uuid;
  v_inserted integer;
BEGIN
  IF p_visitor_key IS NULL OR char_length(p_visitor_key) NOT BETWEEN 8 AND 64
     OR p_visitor_key !~ '^[A-Za-z0-9_-]+$' THEN
    RAISE EXCEPTION 'Invalid visitor key' USING ERRCODE = '22023';
  END IF;
  SELECT id INTO v_chat_id FROM public.agent_chats
  WHERE share_id = p_share_id AND is_public = true AND deleted_at IS NULL
    AND (auth.uid() IS NULL OR user_id IS DISTINCT FROM auth.uid())
  FOR UPDATE;
  IF v_chat_id IS NULL THEN RETURN; END IF;
  INSERT INTO public.debate_views(chat_id, visitor_key)
  VALUES (v_chat_id, encode(extensions.digest(p_visitor_key, 'sha256'), 'hex'))
  ON CONFLICT DO NOTHING;
  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  IF v_inserted = 1 THEN
    UPDATE public.agent_chats SET real_view_count = real_view_count + 1 WHERE id = v_chat_id;
  END IF;
END;
$function$;
REVOKE ALL ON FUNCTION public.record_debate_view(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_debate_view(text, text) TO anon, authenticated;
