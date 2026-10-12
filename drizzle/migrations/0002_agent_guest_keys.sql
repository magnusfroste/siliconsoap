CREATE TABLE public.agent_guest_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash text NOT NULL UNIQUE,
  key_prefix text NOT NULL,
  credits_remaining integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_ip_hash text,
  last_used_at timestamptz,
  claimed_by uuid,
  claimed_at timestamptz,
  revoked_at timestamptz
);
GRANT ALL ON public.agent_guest_keys TO service_role;
ALTER TABLE public.agent_guest_keys ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.agent_chats ADD COLUMN IF NOT EXISTS guest_key_id uuid REFERENCES public.agent_guest_keys(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS agent_chats_guest_key_id_idx ON public.agent_chats(guest_key_id);

CREATE OR REPLACE FUNCTION public.use_guest_key_credit(p_key_hash text)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_remaining integer;
BEGIN
  UPDATE public.agent_guest_keys
     SET credits_remaining = credits_remaining - 1, last_used_at = now()
   WHERE key_hash = p_key_hash AND revoked_at IS NULL AND credits_remaining > 0
  RETURNING credits_remaining INTO v_remaining;
  RETURN coalesce(v_remaining, -1);
END $$;
REVOKE ALL ON FUNCTION public.use_guest_key_credit(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.use_guest_key_credit(text) TO service_role;

INSERT INTO public.feature_flags (key, name, description, enabled)
VALUES ('agent_guest_keys_enabled', 'Agent guest keys', 'Allow creating guest connector links for the second-opinion MCP endpoint', true)
ON CONFLICT (key) DO NOTHING;