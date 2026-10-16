-- Veckosvep 2026-10-17: ägarpolicyer för UPDATE saknade WITH CHECK.
-- Utan WITH CHECK kunde en användare flytta sin rad till en annan användare
-- (t.ex. api_keys.user_id -> offrets id, och sedan använda nyckeln mot agent-MCP:n
-- för att spendera offrets krediter) eller sätta agent_profiles.is_system = true
-- så att den egna personan dök upp i den publika systemlistan.
alter policy "Users can update own chats" on public.agent_chats with check (auth.uid() = user_id);
alter policy "Users can update own profiles" on public.agent_profiles with check ((auth.uid() = user_id) and (is_system = false));
alter policy "Users can update own profile" on public.user_profiles with check (auth.uid() = user_id);
alter policy "Users can update own api keys" on public.api_keys with check (auth.uid() = user_id);

-- use_tokens anropas från klienten med token-antal som klienten själv anger.
-- Negativa värden sänkte tokens_used och gav i praktiken obegränsad budget.
create or replace function public.assert_nonnegative_tokens(p_prompt integer, p_completion integer)
returns void language plpgsql immutable set search_path to 'public' as $f$
begin
  if coalesce(p_prompt,0) < 0 or coalesce(p_completion,0) < 0 then
    raise exception 'Token counts must be non-negative' using errcode = '22023';
  end if;
end $f$;

do $$ declare d text; begin
  d := pg_get_functiondef('public.use_tokens(uuid,uuid,text,integer,integer,numeric,text)'::regprocedure);
  if position('assert_nonnegative_tokens' in d) = 0 then
    d := replace(d, 'PERFORM public.assert_credit_caller(p_user_id);',
      'PERFORM public.assert_credit_caller(p_user_id);
  PERFORM public.assert_nonnegative_tokens(p_prompt_tokens, p_completion_tokens);');
    execute d;
  end if;
end $$;
