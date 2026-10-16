-- Veckosvep 2026-10-17: ägaren kunde själv sätta featured_at (och view_count) på sina
-- debatter via UPDATE-policyn och därmed lyfta in dem i "Showdowns" på /explore och
-- startsidan. Från klienten (anon/authenticated, ej admin) behålls nu de fälten;
-- service_role, SECURITY DEFINER-funktioner (increment_chat_view_count) och admins påverkas inte.
create or replace function public.protect_agent_chat_moderation_fields() returns trigger language plpgsql set search_path to 'public' as $f$
begin
  if current_user in ('anon','authenticated') and not coalesce(public.has_role(auth.uid(), 'admin'), false) then
    if tg_op = 'INSERT' then
      new.featured_at := null;
      new.view_count := 0;
      new.guest_key_id := null;
    else
      new.featured_at := old.featured_at;
      new.view_count := old.view_count;
      new.guest_key_id := old.guest_key_id;
    end if;
  end if;
  return new;
end $f$;
drop trigger if exists protect_agent_chat_moderation_fields on public.agent_chats;
create trigger protect_agent_chat_moderation_fields before insert or update on public.agent_chats
  for each row execute function public.protect_agent_chat_moderation_fields();
