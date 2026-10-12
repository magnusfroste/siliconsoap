-- Read-only integration tests: run with psql -X -v ON_ERROR_STOP=1 -f this file.
DO $test$
DECLARE body text; bad integer;
BEGIN
 SELECT pg_get_functiondef('public.model_scoreboard()'::regprocedure) INTO body;
 IF body NOT LIKE '%m.model AS model_id%' THEN RAISE EXCEPTION 'Scoreboard must attribute to requested cast model'; END IF;
 IF body NOT LIKE '%m.model <> ''human''%' OR body NOT LIKE '%m.agent <> ''You''%' THEN RAISE EXCEPTION 'Human turns must be excluded'; END IF;
 IF body NOT LIKE '%c.deleted_at IS NULL%' THEN RAISE EXCEPTION 'Deleted debates must be excluded'; END IF;
 IF body NOT LIKE '%COALESCE(c.title, ''%''::text) !~~ ''[Test]%%' AND body NOT LIKE '%coalesce(c.title,%NOT LIKE ''[Test]%%' THEN RAISE EXCEPTION 'Test titles must be excluded'; END IF;
 IF body NOT LIKE '%lower(u.email) NOT LIKE ''%@example.com''%' THEN RAISE EXCEPTION 'Example accounts must be excluded'; END IF;
 IF body NOT LIKE '%k.created_ip_hash IS DISTINCT FROM ''claude-qa''%' THEN RAISE EXCEPTION 'QA key panels must be excluded'; END IF;
 IF body NOT LIKE '%2026-10-10 21:00+00%' THEN RAISE EXCEPTION 'Tracked cutoff must be 10 October at 21:00 UTC'; END IF;
 IF body NOT LIKE '%e.answered_by_model IS NULL%' THEN RAISE EXCEPTION 'Self answered must require null fallback'; END IF;
 SELECT count(*) INTO bad FROM public.model_scoreboard() WHERE tracked_answers < self_answered OR unsourced_answers > answers OR public_debates > debates;
 IF bad <> 0 THEN RAISE EXCEPTION 'Scoreboard returned invalid counters'; END IF;
 IF NOT has_function_privilege('anon','public.model_scoreboard()','EXECUTE') OR NOT has_function_privilege('authenticated','public.model_scoreboard()','EXECUTE') THEN RAISE EXCEPTION 'Public execution must be granted'; END IF;
 IF EXISTS (SELECT 1 FROM pg_proc WHERE oid='public.model_scoreboard()'::regprocedure AND (NOT prosecdef OR provolatile <> 's')) THEN RAISE EXCEPTION 'Must be stable security definer'; END IF;
END $test$;

-- Verify all five original-text metrics against the eligible real rows. No text is returned.
DO $original_metrics$
DECLARE bad integer;
BEGIN
 WITH eligible AS (
 SELECT m.*, c.is_public FROM public.agent_chat_messages m JOIN public.agent_chats c ON c.id=m.chat_id
 LEFT JOIN auth.users u ON u.id=c.user_id LEFT JOIN public.agent_guest_keys k ON k.id=c.guest_key_id
 WHERE m.model <> 'human' AND m.agent <> 'You' AND c.deleted_at IS NULL
 AND coalesce(c.title,'') NOT LIKE '[Test]%' AND (u.email IS NULL OR lower(u.email) NOT LIKE '%@example.com')
 AND k.created_ip_hash IS DISTINCT FROM 'claude-qa'
 ), expected AS (
 SELECT model,
 count(*) FILTER (WHERE answered_by_model IS NULL) AS answers,
 count(DISTINCT chat_id) FILTER (WHERE answered_by_model IS NULL) AS debates,
 count(DISTINCT chat_id) FILTER (WHERE answered_by_model IS NULL AND is_public) AS public_debates,
 coalesce(round(avg(CASE WHEN btrim(message)='' THEN 0 ELSE cardinality(regexp_split_to_array(btrim(message),'\s+')) END) FILTER (WHERE answered_by_model IS NULL)),0) AS avg_words,
 count(*) FILTER (WHERE answered_by_model IS NULL AND message ~* '(\d+(\.\d+)?\s?%|[$€£]\s?\d|\d+(\.\d+)?\s?(billion|million|trillion|bn)\y)' AND message !~* '(according to|source:|\[\d+\]|https?://|study by|report by|data from)') AS unsourced_answers,
 count(*) FILTER (WHERE created_at >= timestamptz '2026-10-10 21:00+00') AS tracked_answers,
 count(*) FILTER (WHERE created_at >= timestamptz '2026-10-10 21:00+00' AND answered_by_model IS NULL) AS self_answered
 FROM eligible GROUP BY model
 ) SELECT count(*) INTO bad FROM expected e FULL JOIN public.model_scoreboard() s ON s.model_id=e.model
 WHERE ROW(e.answers,e.debates,e.public_debates,e.avg_words,e.unsourced_answers,e.tracked_answers,e.self_answered)
 IS DISTINCT FROM ROW(s.answers,s.debates,s.public_debates,s.avg_words,s.unsourced_answers,s.tracked_answers,s.self_answered);
 IF bad > 0 THEN RAISE EXCEPTION 'Original-only metrics or all-row tracked counts differ from expected'; END IF;
END $original_metrics$;
