
-- Temporary helpers that mirror the JS soap-name generator,
-- so we can rewrite "Agent A/B/C" mentions in existing messages.

CREATE OR REPLACE FUNCTION pg_temp_soap_hash(s text) RETURNS bigint AS $$
DECLARE
  h bigint := 0;
  i int;
  ch int;
  shifted bigint;
BEGIN
  FOR i IN 1..length(s) LOOP
    ch := ascii(substr(s, i, 1));
    shifted := h * 32 - h + ch;  -- (h << 5) - h + ch
    -- truncate to signed int32 like JS bitwise ops
    h := ((shifted + 2147483648) % 4294967296)::bigint - 2147483648;
  END LOOP;
  RETURN abs(h);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION pg_temp_fix_chat_agent_names(p_chat_id uuid) RETURNS int AS $$
DECLARE
  male_names text[]   := ARRAY['J.R.','Blake','Ridge','Eric','Victor','Jack','Tad','Luke','Sonny','Jason','Bo','John','Stefano','Ross','Chandler','Big','Don','Roger','Chuck','Nate','Dan'];
  female_names text[] := ARRAY['Alexis','Krystle','Fallon','Brooke','Stephanie','Taylor','Nikki','Erica','Laura','Carly','Hope','Marlena','Rachel','Monica','Phoebe','Carrie','Samantha','Charlotte','Miranda','Peggy','Betty','Joan','Serena','Blair'];
  last_names text[]   := ARRAY['Ewing','Carrington','Colby','Forrester','Newman','Abbott','Chancellor','Kane','Martin','Quartermaine','Spencer','Corinthos','Brady','DiMera','Horton','Buchanan','Chandler','Santos','Montgomery','Hayward','van der Woodsen','Waldorf','Bass','Archibald','Humphrey','Bradshaw','York','Hobbes','Sterling','Draper'];
  r record;
  used_first text[] := ARRAY[]::text[];
  name_a text := NULL;
  name_b text := NULL;
  name_c text := NULL;
  h bigint;
  first_arr text[];
  fn text;
  ln text;
  idx int;
  attempts int;
  updated_count int := 0;
BEGIN
  -- Walk distinct (letter, persona) pairs in order of first appearance,
  -- matching the JS uniqueness logic (first-come keeps preferred name).
  FOR r IN
    SELECT letter, persona FROM (
      SELECT
        regexp_replace(agent, '^Agent ', '') AS letter,
        persona,
        MIN(created_at) AS first_seen
      FROM public.agent_chat_messages
      WHERE chat_id = p_chat_id
        AND agent ~ '^Agent [ABC]$'
      GROUP BY 1, 2
    ) s
    ORDER BY first_seen
  LOOP
    -- gender: B = female, A/C = male
    first_arr := CASE WHEN r.letter = 'B' THEN female_names ELSE male_names END;
    h := pg_temp_soap_hash('Agent ' || r.letter || '-' || r.persona);
    idx := (h % array_length(first_arr, 1))::int;
    fn := first_arr[idx + 1];  -- 1-based
    attempts := 0;
    WHILE fn = ANY(used_first) AND attempts < array_length(first_arr, 1) LOOP
      idx := (idx + 1) % array_length(first_arr, 1);
      fn := first_arr[idx + 1];
      attempts := attempts + 1;
    END LOOP;
    used_first := array_append(used_first, fn);
    ln := last_names[((h / 16)::bigint % array_length(last_names, 1))::int + 1];

    IF r.letter = 'A' AND name_a IS NULL THEN name_a := fn || ' ' || ln;
    ELSIF r.letter = 'B' AND name_b IS NULL THEN name_b := fn || ' ' || ln;
    ELSIF r.letter = 'C' AND name_c IS NULL THEN name_c := fn || ' ' || ln;
    END IF;
  END LOOP;

  -- Apply replacements
  UPDATE public.agent_chat_messages m
  SET message = (
    SELECT
      regexp_replace(
        regexp_replace(
          regexp_replace(m.message,
            '\mAgents?\s+A\M', COALESCE(name_a, 'Agent A'), 'g'),
          '\mAgents?\s+B\M', COALESCE(name_b, 'Agent B'), 'g'),
        '\mAgents?\s+C\M', COALESCE(name_c, 'Agent C'), 'g')
  )
  WHERE m.chat_id = p_chat_id
    AND m.message ~ '\mAgents?\s+[ABC]\M';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  c record;
  total int := 0;
  n int;
BEGIN
  FOR c IN
    SELECT DISTINCT chat_id
    FROM public.agent_chat_messages
    WHERE message ~ '\mAgents?\s+[ABC]\M'
  LOOP
    n := pg_temp_fix_chat_agent_names(c.chat_id);
    total := total + n;
  END LOOP;
  RAISE NOTICE 'Updated % messages across chats', total;
END $$;

DROP FUNCTION pg_temp_fix_chat_agent_names(uuid);
DROP FUNCTION pg_temp_soap_hash(text);
