-- Drop and recreate get_shared_chat function to include view_count
DROP FUNCTION IF EXISTS public.get_shared_chat(text);

CREATE OR REPLACE FUNCTION public.get_shared_chat(p_share_id text)
 RETURNS TABLE(
   id uuid, 
   title text, 
   prompt text, 
   scenario_id text, 
   settings jsonb, 
   share_id text, 
   is_public boolean, 
   created_at timestamp with time zone, 
   updated_at timestamp with time zone, 
   deleted_at timestamp with time zone,
   view_count integer
 )
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    id,
    title,
    prompt,
    scenario_id,
    settings,
    share_id,
    is_public,
    created_at,
    updated_at,
    deleted_at,
    view_count
  FROM public.agent_chats
  WHERE agent_chats.share_id = p_share_id
  LIMIT 1;
$function$;