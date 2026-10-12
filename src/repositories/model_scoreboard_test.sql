-- Read-only integration tests: run with psql -X -v ON_ERROR_STOP=1 -f this file.
DO $test$
DECLARE body text; bad integer;
BEGIN
 SELECT pg_get_functiondef('public.model_scoreboard()'::regprocedure) INTO body;
 IF body NOT LIKE '%m.model AS model_id%' THEN RAISE EXCEPTION 'Scoreboard must attribute to requested cast model'; END IF;
 IF body NOT LIKE '%m.model <> ''human''%' OR body NOT LIKE '%m.agent <> ''You''%' THEN RAISE EXCEPTION 'Human turns must be excluded'; END IF;
 IF body NOT LIKE '%c.deleted_at IS NULL%' THEN RAISE EXCEPTION 'Deleted debates must be excluded'; END IF;
 IF body NOT LIKE '%c.title NOT LIKE ''[Test]%%' THEN RAISE EXCEPTION 'Test titles must be excluded'; END IF;
 IF body NOT LIKE '%lower(u.email) NOT LIKE ''%@example.com''%' THEN RAISE EXCEPTION 'Example accounts must be excluded'; END IF;
 IF body NOT LIKE '%k.created_ip_hash IS DISTINCT FROM ''claude-qa''%' THEN RAISE EXCEPTION 'QA key panels must be excluded'; END IF;
 IF body NOT LIKE '%2026-10-10 21:00+00%' THEN RAISE EXCEPTION 'Tracked cutoff must be 10 October at 21:00 UTC'; END IF;
 IF body NOT LIKE '%e.answered_by_model IS NULL%' THEN RAISE EXCEPTION 'Self answered must require null fallback'; END IF;
 SELECT count(*) INTO bad FROM public.model_scoreboard() WHERE answers < tracked_answers OR tracked_answers < self_answered OR unsourced_answers > answers OR public_debates > debates;
 IF bad <> 0 THEN RAISE EXCEPTION 'Scoreboard returned invalid counters'; END IF;
 IF NOT has_function_privilege('anon','public.model_scoreboard()','EXECUTE') OR NOT has_function_privilege('authenticated','public.model_scoreboard()','EXECUTE') THEN RAISE EXCEPTION 'Public execution must be granted'; END IF;
 IF EXISTS (SELECT 1 FROM pg_proc WHERE oid='public.model_scoreboard()'::regprocedure AND (NOT prosecdef OR provolatile <> 's')) THEN RAISE EXCEPTION 'Must be stable security definer'; END IF;
END $test$;
