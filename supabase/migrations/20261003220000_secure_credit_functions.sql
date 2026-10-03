-- ============================================================
-- Security hardening (2026-10-03)
--
-- use_credit(p_user_id) and use_tokens(p_user_id, …) are SECURITY DEFINER and
-- were executable by anyone, including anonymous callers, for ANY user id:
-- anyone could drain another user's credits and write fake token usage.
-- They are now limited to the caller's own user id (or admin / service role),
-- and anonymous callers can no longer execute them.
-- ============================================================

create or replace function public.assert_credit_caller(p_user_id uuid)
returns void
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if coalesce(auth.role(), '') = 'service_role' then
    return;
  end if;
  if auth.uid() is not null and (auth.uid() = p_user_id or public.has_role(auth.uid(), 'admin')) then
    return;
  end if;
  raise exception 'Not allowed to use credits for another user' using errcode = '42501';
end $$;

-- Insert the guard as the first statement of every overload.
do $$
declare
  f record;
  def text;
begin
  for f in
    select p.oid from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname in ('use_credit', 'use_tokens')
  loop
    def := pg_get_functiondef(f.oid);
    if position('assert_credit_caller' in def) = 0 then
      def := regexp_replace(def, E'\nBEGIN\n', E'\nBEGIN\n  PERFORM public.assert_credit_caller(p_user_id);\n');
      execute def;
    end if;
  end loop;
end $$;

revoke execute on function public.use_credit(uuid) from anon, public;
revoke execute on function public.use_tokens(uuid, uuid, text, integer, integer, numeric) from anon, public;
revoke execute on function public.use_tokens(uuid, uuid, text, integer, integer, numeric, text) from anon, public;
grant execute on function public.use_credit(uuid) to authenticated, service_role;
grant execute on function public.use_tokens(uuid, uuid, text, integer, integer, numeric) to authenticated, service_role;
grant execute on function public.use_tokens(uuid, uuid, text, integer, integer, numeric, text) to authenticated, service_role;
