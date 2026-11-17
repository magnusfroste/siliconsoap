-- Integration regression tests. Fixtures and increments are rolled back.
-- Run with a privileged test connection; the sandbox_exec role cannot run existing auth-aware triggers.
-- psql -X -v ON_ERROR_STOP=1 -f src/repositories/debate_views_test.sql
BEGIN;
INSERT INTO public.agent_chats(id, title, scenario_id, prompt, is_public, share_id, view_count, user_id, deleted_at)
VALUES
 ('ff000000-0000-4000-8000-000000000001', '[Test] real views', 'debate', 'Test', true, 'qa-real-views-public', 42, (SELECT user_id FROM public.agent_chats WHERE user_id IS NOT NULL LIMIT 1), NULL),
 ('ff000000-0000-4000-8000-000000000002', '[Test] private views', 'debate', 'Test', false, 'qa-real-views-private', 42, NULL, NULL),
 ('ff000000-0000-4000-8000-000000000003', '[Test] deleted views', 'debate', 'Test', true, 'qa-real-views-deleted', 42, NULL, now());

SET LOCAL ROLE anon;
SELECT public.record_debate_view('qa-real-views-public', 'visitor_123');
SELECT public.record_debate_view('qa-real-views-public', 'visitor_123');
SELECT public.record_debate_view('qa-real-views-private', 'visitor_123');
SELECT public.record_debate_view('qa-real-views-deleted', 'visitor_123');
SELECT public.record_debate_view('qa-missing-debate', 'visitor_123');
DO $test$
DECLARE key text;
BEGIN
  FOREACH key IN ARRAY ARRAY[NULL, 'short', repeat('a', 65), 'invalid/key', E'new_line\n'] LOOP
    BEGIN
      PERFORM public.record_debate_view('qa-real-views-public', key);
      RAISE EXCEPTION 'Invalid key was accepted: %', key;
    EXCEPTION WHEN invalid_parameter_value THEN NULL;
    END;
  END LOOP;
END $test$;
RESET ROLE;

DO $test$
BEGIN
  IF (SELECT real_view_count FROM public.agent_chats WHERE share_id = 'qa-real-views-public') <> 1 THEN RAISE EXCEPTION 'Duplicate daily visit counted'; END IF;
  IF EXISTS (SELECT 1 FROM public.agent_chats WHERE share_id IN ('qa-real-views-private', 'qa-real-views-deleted') AND real_view_count <> 0) THEN RAISE EXCEPTION 'Private/deleted debate counted'; END IF;
  IF EXISTS (SELECT 1 FROM public.agent_chats WHERE id::text LIKE 'ff000000-%' AND view_count <> 42) THEN RAISE EXCEPTION 'Seeded counts changed'; END IF;
  IF (SELECT visitor_key FROM public.debate_views WHERE chat_id = 'ff000000-0000-4000-8000-000000000001') <> encode(extensions.digest('visitor_123', 'sha256'), 'hex') THEN RAISE EXCEPTION 'Raw visitor key persisted'; END IF;
  IF has_table_privilege('anon', 'public.debate_views', 'SELECT') OR has_table_privilege('authenticated', 'public.debate_views', 'INSERT') THEN RAISE EXCEPTION 'Visitor ledger is directly accessible'; END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'debate_views') THEN RAISE EXCEPTION 'Visitor ledger must have no policies'; END IF;
END $test$;

-- A visit on yesterday must not prevent today's insert.
INSERT INTO public.debate_views(chat_id, visitor_key, viewed_on)
VALUES ('ff000000-0000-4000-8000-000000000001', encode(extensions.digest('next_day_123', 'sha256'), 'hex'), current_date - 1);
SET LOCAL ROLE authenticated;
SELECT public.record_debate_view('qa-real-views-public', 'next_day_123');
SELECT public.record_debate_view('qa-real-views-public', repeat('a', 8));
SELECT public.record_debate_view('qa-real-views-public', repeat('b', 64));
RESET ROLE;

SELECT set_config('request.jwt.claim.sub', (SELECT user_id::text FROM public.agent_chats WHERE share_id = 'qa-real-views-public'), true);
SET LOCAL ROLE authenticated;
SELECT public.record_debate_view('qa-real-views-public', 'owner_visit_123');
UPDATE public.agent_chats SET real_view_count = 999 WHERE share_id = 'qa-real-views-public';
RESET ROLE;
DO $test$
BEGIN
  IF (SELECT real_view_count FROM public.agent_chats WHERE share_id = 'qa-real-views-public') <> 4 THEN RAISE EXCEPTION 'Owner exclusion, new-day counting, key boundaries or write protection failed'; END IF;
  IF EXISTS (SELECT 1 FROM public.debate_views WHERE visitor_key = encode(extensions.digest('owner_visit_123', 'sha256'), 'hex')) THEN RAISE EXCEPTION 'Owner entered ledger'; END IF;
  IF NOT has_function_privilege('anon', 'public.record_debate_view(text,text)', 'EXECUTE') OR NOT has_function_privilege('authenticated', 'public.record_debate_view(text,text)', 'EXECUTE') THEN RAISE EXCEPTION 'Counting must allow public and authenticated execution'; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid = 'public.agent_chats'::regclass AND tgname = 'protect_real_debate_views' AND tgenabled = 'O') THEN RAISE EXCEPTION 'Real counter must have write protection'; END IF;
END $test$;
ROLLBACK;