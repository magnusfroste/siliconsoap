-- Transactional integration test: uses an existing credit account, leaves no changes.
BEGIN;
DO $$
DECLARE u uuid; k uuid; before_credits integer; r record; chat_id uuid;
BEGIN
  SELECT user_id, credits_remaining INTO u, before_credits FROM public.user_credits LIMIT 1;
  IF u IS NULL THEN RAISE EXCEPTION 'Needs an existing account'; END IF;
  INSERT INTO public.agent_guest_keys(key_hash,key_prefix,credits_remaining) VALUES ('transactional-claim-test','test-only',3) RETURNING id INTO k;
  INSERT INTO public.agent_chats(title,prompt,scenario_id,user_id,guest_key_id,is_public,settings) VALUES ('Claim test','Claim test','second-opinion',null,k,false,'{"mode":"panel"}') RETURNING id INTO chat_id;
  SELECT * INTO r FROM public.claim_agent_key('transactional-claim-test',u);
  IF r.credits_added <> 3 OR r.panels_moved <> 1 THEN RAISE EXCEPTION 'First claim failed'; END IF;
  SELECT * INTO r FROM public.claim_agent_key('transactional-claim-test',u);
  IF r.credits_added <> 0 OR r.panels_moved <> 0 THEN RAISE EXCEPTION 'Claim not idempotent'; END IF;
  IF (SELECT credits_remaining FROM public.user_credits WHERE user_id=u) <> before_credits+3 THEN RAISE EXCEPTION 'Duplicate credits'; END IF;
  IF (SELECT user_id FROM public.agent_chats WHERE id=chat_id) <> u THEN RAISE EXCEPTION 'Panel not moved'; END IF;
  IF (SELECT is_public FROM public.agent_chats WHERE id=chat_id) THEN RAISE EXCEPTION 'Panel made public'; END IF;
  IF (SELECT credits_remaining FROM public.agent_guest_keys WHERE id=k) <> 0 THEN RAISE EXCEPTION 'Guest balance not cleared'; END IF;
  IF public.use_guest_key_credit('transactional-claim-test') <> -1 THEN RAISE EXCEPTION 'Claimed key still bills as guest'; END IF;
END $$;
ROLLBACK;
