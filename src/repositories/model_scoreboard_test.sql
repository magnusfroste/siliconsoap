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

-- Run the actual aggregate SELECT over synthetic rows, without private-table access or persisted fixtures.
DO $original_metrics$
DECLARE body text; aggregate_sql text; result record;
BEGIN
 SELECT prosrc INTO body FROM pg_proc WHERE oid='public.model_scoreboard()'::regprocedure;
 aggregate_sql := substring(body from position('SELECT e.model_id' in body));
 EXECUTE 'WITH eligible(model_id,chat_id,is_public,message,created_at,answered_by_model) AS (VALUES
 (''cast/model'',''original-chat'',true,''A 50% claim'',timestamptz ''2026-10-10 21:00+00'',NULL::text),
 (''cast/model'',''fallback-chat'',true,''Fallback has 99% and many extra words'',timestamptz ''2026-10-11 21:00+00'',''fallback/model''),
 (''cast/model'',''old-chat'',false,''According to a study 10%'',timestamptz ''2026-10-09 21:00+00'',NULL::text)
 ) ' || aggregate_sql INTO result;
 IF result.answers <> 2 THEN RAISE EXCEPTION 'Fallback text must not count as an answer'; END IF;
 IF result.debates <> 2 THEN RAISE EXCEPTION 'Fallback-only chat must not count as a debate'; END IF;
 IF result.public_debates <> 1 THEN RAISE EXCEPTION 'Fallback-only public chat must not count'; END IF;
 IF result.avg_words <> 4 THEN RAISE EXCEPTION 'Average must exclude fallback words'; END IF;
 IF result.unsourced_answers <> 1 THEN RAISE EXCEPTION 'Unsourced count must exclude fallback claim'; END IF;
 IF result.tracked_answers <> 2 THEN RAISE EXCEPTION 'Tracked turns must retain fallback and include exact cutoff'; END IF;
 IF result.self_answered <> 1 THEN RAISE EXCEPTION 'Self-answering must require null fallback'; END IF;
END $original_metrics$;
