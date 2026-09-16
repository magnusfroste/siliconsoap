import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[LOG-BATTLE-START] ${step}${detailsStr}`);
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const clampInt = (value: unknown, min: number, max: number, fallback: number) => {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

const str = (value: unknown, maxLen: number): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLen);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const admin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  try {
    const body = await req.json().catch(() => ({}));

    // Resolve identity server-side from the bearer token (never trust the body)
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization') ?? '';
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (bearer && bearer !== supabaseAnonKey) {
      const anon = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
      });
      const { data } = await anon.auth.getUser(bearer);
      userId = data?.user?.id ?? null;
    }

    // ---------- Completion ----------
    if (body?.action === 'complete') {
      const analyticsId = str(body.analyticsId, 64);
      const sessionId = str(body.sessionId, 128);
      const chatId = str(body.chatId, 64);
      const totalMessages = clampInt(body.totalMessages, 0, 1000, 0);
      const durationMs = clampInt(body.durationMs, 0, 24 * 60 * 60 * 1000, 0);

      const patch = {
        total_messages: totalMessages,
        generation_duration_ms: durationMs,
        completed_at: new Date().toISOString(),
      };

      let error: unknown = null;

      if (analyticsId && UUID_RE.test(analyticsId) && sessionId) {
        ({ error } = await admin
          .from('chat_analytics')
          .update(patch)
          .eq('id', analyticsId)
          .eq('session_id', sessionId)
          .is('completed_at', null));
      } else if (chatId && UUID_RE.test(chatId) && userId) {
        // Logged-in user completing by chat id — restricted to rows they own
        ({ error } = await admin
          .from('chat_analytics')
          .update(patch)
          .eq('chat_id', chatId)
          .eq('user_id', userId)
          .is('completed_at', null));
      } else if (sessionId) {
        ({ error } = await admin
          .from('chat_analytics')
          .update(patch)
          .eq('session_id', sessionId)
          .is('completed_at', null));
      } else {
        return json({ error: 'analyticsId+sessionId, sessionId or chatId required' }, 400);
      }

      if (error) {
        logStep('Complete failed', { error });
        return json({ error: 'Failed to complete analytics' }, 500);
      }

      logStep('Completed', { analyticsId, chatId, sessionId });
      return json({ success: true });
    }

    // ---------- Start (insert) ----------
    const clientIp =
      req.headers.get('cf-connecting-ip') ||
      req.headers.get('x-real-ip') ||
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-client-ip') ||
      'unknown';

    let countryCode = req.headers.get('cf-ipcountry') || null;
    if (!countryCode && clientIp !== 'unknown') {
      try {
        const geoResponse = await fetch(`https://ipapi.co/${clientIp}/country/`, {
          headers: { 'User-Agent': 'SiliconSoap/1.0' },
        });
        if (geoResponse.ok) {
          const text = (await geoResponse.text()).trim();
          countryCode = text.length === 2 ? text : null;
        }
      } catch (geoError) {
        logStep('Geo lookup failed (non-critical)', { error: String(geoError) });
      }
    }

    const rawChatId = str(body.chatId, 128);
    const chatIdIsUuid = !!rawChatId && UUID_RE.test(rawChatId);
    const sessionId = str(body.sessionId, 128) || rawChatId;

    const modelsUsed = Array.isArray(body.modelsUsed)
      ? body.modelsUsed
          .filter((m: unknown) => typeof m === 'string')
          .slice(0, 3)
          .map((m: string) => m.slice(0, 120))
      : [];

    const row = {
      chat_id: chatIdIsUuid ? rawChatId : null,
      user_id: userId,
      is_guest: !userId,
      prompt_preview: str(body.promptPreview, 200),
      scenario_id: str(body.scenarioId, 64),
      models_used: modelsUsed,
      num_agents: clampInt(body.numAgents, 1, 3, 1),
      num_rounds: clampInt(body.numRounds, 1, 10, 1),
      user_agent: str(req.headers.get('user-agent'), 500),
      started_at: new Date().toISOString(),
      session_id: sessionId,
      ip_address: clientIp,
      country_code: countryCode,
    };

    const { data, error } = await admin
      .from('chat_analytics')
      .insert(row)
      .select('id')
      .single();

    if (error) {
      logStep('Insert failed', { error });
      return json({ error: 'Failed to log analytics' }, 500);
    }

    logStep('Analytics row created', { analyticsId: data.id, isGuest: !userId, countryCode });
    return json({ analyticsId: data.id, sessionId });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logStep('Error', { message: errorMessage });
    return json({ error: errorMessage }, 500);
  }
});
