CREATE OR REPLACE FUNCTION public.model_scoreboard()
RETURNS TABLE(model_id text, answers bigint, debates bigint, public_debates bigint, avg_words numeric, unsourced_answers bigint, tracked_answers bigint, self_answered bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $function$
WITH eligible AS (
 SELECT m.model AS model_id, m.chat_id, c.is_public, m.message, m.created_at, m.answered_by_model
 FROM public.agent_chat_messages m
 JOIN public.agent_chats c ON c.id = m.chat_id
 LEFT JOIN auth.users u ON u.id = c.user_id
 LEFT JOIN public.agent_guest_keys k ON k.id = c.guest_key_id
 WHERE m.model <> 'human' AND m.agent <> 'You'
 AND c.deleted_at IS NULL AND c.title NOT LIKE '[Test]%'
 AND (u.email IS NULL OR lower(u.email) NOT LIKE '%@example.com')
 AND (k.created_ip_hash IS DISTINCT FROM 'claude-qa')
)
SELECT e.model_id, count(*) AS answers, count(DISTINCT e.chat_id) AS debates,
 count(DISTINCT e.chat_id) FILTER (WHERE e.is_public) AS public_debates,
 round(avg(CASE WHEN btrim(e.message) = '' THEN 0 ELSE cardinality(regexp_split_to_array(btrim(e.message), '\s+')) END)) AS avg_words,
 count(*) FILTER (WHERE e.message ~* '(\d+(\.\d+)?\s?%|[$€£]\s?\d|\d+(\.\d+)?\s?(billion|million|trillion|bn)\y)' AND e.message !~* '(according to|source:|\[\d+\]|https?://|study by|report by|data from)') AS unsourced_answers,
 count(*) FILTER (WHERE e.created_at >= timestamptz '2026-10-10 21:00+00') AS tracked_answers,
 count(*) FILTER (WHERE e.created_at >= timestamptz '2026-10-10 21:00+00' AND e.answered_by_model IS NULL) AS self_answered
FROM eligible e GROUP BY e.model_id;
$function$;
REVOKE ALL ON FUNCTION public.model_scoreboard() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.model_scoreboard() TO anon, authenticated, service_role;
COMMENT ON FUNCTION public.model_scoreboard() IS 'Aggregate behaviour by requested cast model; fallback answers stay in the denominator of answered-itself reliability. No transcript or user data returned.';