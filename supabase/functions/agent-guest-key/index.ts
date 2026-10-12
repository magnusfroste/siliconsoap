// Creates a personal guest connector link for the "agent" MCP endpoint. The plaintext key is returned once.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { getClientIp, hashIp } from '../_shared/requestGuards.ts';
import { generateGuestKey, keyPrefix, sha256Hex } from '../_shared/panelPure.ts';

import { corsHeaders } from 'npm:@supabase/supabase-js@2.117.3/cors';
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const supabase = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  const bearer = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  let userId: string | null = null;
  if (bearer) {
    const { data, error } = await supabase.auth.getClaims(bearer);
    if (!error && data?.claims?.role === 'authenticated' && typeof data.claims.sub === 'string') userId = data.claims.sub;
    else if (!error && data?.claims?.role !== 'anon') return json({ error: 'Invalid session' }, 401);
    else if (error) return json({ error: 'Invalid session' }, 401);
  }
  const { data: flags } = await supabase.from('feature_flags').select('key, enabled, numeric_value').in('key', ['agent_guest_keys_enabled', 'guest_credits_amount']);
  const kill = flags?.find((f) => f.key === 'agent_guest_keys_enabled');
  if (kill && kill.enabled === false) return json({ error: 'Guest connector links are paused right now.', code: 'DISABLED' }, 403);
  const creditsFlag = flags?.find((f) => f.key === 'guest_credits_amount');
  const credits = userId ? 0 : creditsFlag?.enabled !== false && typeof creditsFlag?.numeric_value === 'number' ? creditsFlag.numeric_value : 3;

  const ipHash = await hashIp(getClientIp(req.headers));
  const { data: allowed, error: rlErr } = await supabase.rpc('bump_rate_limit', { p_bucket: `agent-guest-key:${ipHash}`, p_window_seconds: 86400, p_max: 3 });
  if (rlErr) console.warn('[agent-guest-key] rate-limit check failed, allowing', rlErr.message);
  else if (allowed === false) return json({ error: 'You can create at most 3 guest links per day.', code: 'RATE_LIMIT' }, 429);

  const key = generateGuestKey();
  const { error } = await supabase.from('agent_guest_keys').insert({
    key_hash: await sha256Hex(key), key_prefix: keyPrefix(key), credits_remaining: credits, created_ip_hash: ipHash, claimed_by: userId, claimed_at: userId ? new Date().toISOString() : null,
  });
  if (error) { console.error('[agent-guest-key] insert failed', error.message); return json({ error: 'Could not create a link.' }, 500); }

  return json({ connector_url: `${SUPABASE_URL}/functions/v1/agent?key=${key}`, key_prefix: keyPrefix(key), credits });
});
