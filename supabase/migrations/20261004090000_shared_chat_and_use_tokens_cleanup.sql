-- ============================================================
-- Cleanup (2026-10-04)
--
-- 1. use_tokens had two overloads (6 args, and 7 args where the 7th has a
--    default). Calls with 6 named args were ambiguous and failed silently
--    (PGRST203), so the older 6-arg overload is removed. All callers now use
--    the 7-arg version (guarded by assert_credit_caller).
-- 2. get_shared_chat returned a chat for any known share_id, also after it
--    was unshared or deleted. It now only returns public, non-deleted chats.
-- ============================================================

drop function if exists public.use_tokens(uuid, uuid, text, integer, integer, numeric);

create or replace function public.get_shared_chat(p_share_id text)
returns table(id uuid, title text, prompt text, scenario_id text, settings jsonb, share_id text, is_public boolean, created_at timestamptz, updated_at timestamptz, deleted_at timestamptz, view_count integer)
language sql
stable
security definer
set search_path to 'public'
as $function$
  select
    id, title, prompt, scenario_id, settings, share_id, is_public,
    created_at, updated_at, deleted_at, view_count
  from public.agent_chats
  where agent_chats.share_id = p_share_id
    and agent_chats.is_public = true
    and agent_chats.deleted_at is null
  limit 1;
$function$;
