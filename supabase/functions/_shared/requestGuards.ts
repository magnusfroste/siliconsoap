// Pure guards for shared-key edge function calls (openrouter-chat, text-to-speech).
import { BASE_MAX_TOKENS } from './tokenBudget.ts';

export const MAX_BASE_TOKENS = BASE_MAX_TOKENS.long; // 1200, largest the app sends
export const MAX_BOOSTED_TOKENS = MAX_BASE_TOKENS * 6;
export const MAX_MESSAGES = 60;
export const MAX_TOTAL_CHARS = 150_000;
export const ALWAYS_ALLOWED_MODELS = ['anthropic/claude-3.5-sonnet', 'openai/gpt-4o-mini'];

export const isModelAllowed = (model: unknown, allowlist: Set<string>): boolean =>
  typeof model === 'string' && model.length > 0 && allowlist.has(model);

export const buildAllowlist = (curated: string[], judgeModel?: string | null): Set<string> => {
  const s = new Set<string>(ALWAYS_ALLOWED_MODELS);
  curated.forEach((m) => m && s.add(m));
  if (judgeModel && judgeModel.trim()) s.add(judgeModel.trim());
  return s;
};

export const clampMaxTokens = (value: unknown, fallback: number): number => {
  const n = typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback;
  return Math.min(Math.floor(n), MAX_BASE_TOKENS);
};

export const capBoostedTokens = (value: number): number => Math.min(value, MAX_BOOSTED_TOKENS);

const contentLength = (content: unknown): number => {
  if (typeof content === 'string') return content.length;
  if (Array.isArray(content)) {
    return content.reduce((sum: number, part: any) => {
      if (typeof part === 'string') return sum + part.length;
      if (typeof part?.text === 'string') return sum + part.text.length;
      return sum + JSON.stringify(part ?? '').length;
    }, 0);
  }
  return content == null ? 0 : JSON.stringify(content).length;
};

export const totalMessageChars = (messages: unknown[]): number =>
  messages.reduce((sum: number, m: any) => sum + contentLength(m?.content), 0);

export const validateMessages = (messages: unknown): { ok: true; totalChars: number } | { ok: false } => {
  if (!Array.isArray(messages) || messages.length < 1 || messages.length > MAX_MESSAGES) return { ok: false };
  const totalChars = totalMessageChars(messages);
  if (totalChars > MAX_TOTAL_CHARS) return { ok: false };
  return { ok: true, totalChars };
};

export const VOICE_ID_RE = /^[A-Za-z0-9]{10,40}$/;
export const MAX_TTS_CHARS = 5000;
export const validateTts = (text: unknown, voiceId: unknown): boolean =>
  typeof text === 'string' && text.length > 0 && text.length <= MAX_TTS_CHARS &&
  typeof voiceId === 'string' && VOICE_ID_RE.test(voiceId);

export const getClientIp = (headers: Headers): string =>
  headers.get('cf-connecting-ip') ||
  headers.get('x-real-ip') ||
  headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
  headers.get('x-client-ip') ||
  'unknown';

export const hashIp = async (ip: string): Promise<string> => {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
};

/** Fail-open rate limit via the bump_rate_limit RPC (service role). Returns true when allowed. */
export const checkRateLimit = async (bucketPrefix: string, ip: string, windowSeconds: number, max: number): Promise<boolean> => {
  try {
    const url = Deno.env.get('SUPABASE_URL');
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) return true;
    const bucket = `${bucketPrefix}:${await hashIp(ip)}`;
    const res = await fetch(`${url}/rest/v1/rpc/bump_rate_limit`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_bucket: bucket, p_window_seconds: windowSeconds, p_max: max }),
    });
    if (!res.ok) {
      console.warn('[rate-limit] check failed, allowing:', res.status, await res.text());
      return true;
    }
    return (await res.json()) !== false;
  } catch (err) {
    console.warn('[rate-limit] check errored, allowing:', err);
    return true;
  }
};

/** Reads one feature flag row via service role. */
export const fetchFlag = async (key: string): Promise<{ enabled: boolean; text_value: string | null; numeric_value: number | null } | null> => {
  const url = Deno.env.get('SUPABASE_URL');
  const sk = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !sk) return null;
  const res = await fetch(`${url}/rest/v1/feature_flags?key=eq.${encodeURIComponent(key)}&select=enabled,text_value,numeric_value&limit=1`, {
    headers: { apikey: sk, Authorization: `Bearer ${sk}` },
  });
  if (!res.ok) return null;
  const rows = await res.json();
  return rows?.[0] ?? null;
};

/** Anonymous caller: no bearer token, or the bearer is the public anon key. */
export const isAnonCaller = (bearer: string, anonKey: string): boolean =>
  !bearer || (!!anonKey && bearer === anonKey);

export const bearerFrom = (headers: Headers): string => {
  const h = headers.get('authorization') || '';
  return h.startsWith('Bearer ') ? h.slice(7).trim() : '';
};

export const DEFAULT_GUEST_DAILY_LIMIT = 400;
export const resolveGuestDailyLimit = (flag: { enabled: boolean; numeric_value?: number | null } | null): number =>
  flag && flag.enabled && typeof flag.numeric_value === 'number' && flag.numeric_value > 0
    ? flag.numeric_value : DEFAULT_GUEST_DAILY_LIMIT;

let guestLimitCache: { value: number; at: number } | null = null;
/** Cached ~60 s per function instance. */
export const getGuestDailyLimit = async (): Promise<number> => {
  if (guestLimitCache && Date.now() - guestLimitCache.at < 60_000) return guestLimitCache.value;
  let value = DEFAULT_GUEST_DAILY_LIMIT;
  try { value = resolveGuestDailyLimit(await fetchFlag('guest_daily_call_limit')); } catch { /* fallback */ }
  guestLimitCache = { value, at: Date.now() };
  return value;
};
