
ALTER TABLE public.agent_chats
  ADD COLUMN IF NOT EXISTS run_status text,
  ADD COLUMN IF NOT EXISTS run_error text,
  ADD COLUMN IF NOT EXISTS run_current_round integer,
  ADD COLUMN IF NOT EXISTS run_total_rounds integer,
  ADD COLUMN IF NOT EXISTS run_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS run_completed_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_agent_chats_run_status ON public.agent_chats(run_status) WHERE run_status IS NOT NULL;
