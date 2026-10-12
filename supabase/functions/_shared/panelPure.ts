// Pure helpers for the second-opinion panel (no I/O). Tested in agent/panel_test.ts.

export interface PanelModel {
  model_id: string;
  display_name: string;
  provider: string;
  origin_region: string | null;
  license_type: string | null;
  speed_rating: string | null;
  price_tier: string | null;
  sort_order: number | null;
  disable_reasoning: boolean;
  /** USD per output token (OpenRouter units). */
  price_output?: number | null;
  /** Guest-only extra: usable solely as a fallback for an EU seat. */
  eu_fallback_only?: boolean;
}

export type PanelChoice = 'mixed' | 'eu' | 'open-weights' | string[];

export const FALLBACK_MODEL = 'openai/gpt-4o-mini';
export const ANGLES = ['independent expert', 'skeptical reviewer', 'practical implementer'] as const;
const PRICE_RANK: Record<string, number> = { budget: 0, standard: 1, premium: 2 };

const byCost = (a: PanelModel, b: PanelModel) =>
  (PRICE_RANK[a.price_tier || 'standard'] ?? 1) - (PRICE_RANK[b.price_tier || 'standard'] ?? 1) ||
  (a.sort_order ?? 999) - (b.sort_order ?? 999);

/** Fast models first, then medium as fallback; anything else excluded. */
const speedPool = (models: PanelModel[]) => [
  ...models.filter((m) => m.speed_rating === 'fast').sort(byCost),
  ...models.filter((m) => m.speed_rating === 'medium').sort(byCost),
];

const add = (chosen: PanelModel[], m: PanelModel | undefined) => {
  if (m && !chosen.some((c) => c.model_id === m.model_id)) chosen.push(m);
};

export type Resolution = { ok: true; models: PanelModel[] } | { ok: false; error: string };

export function resolvePanel(choice: PanelChoice | undefined, all: PanelModel[], guest = false): Resolution {
  all = all.filter((m) => !m.eu_fallback_only);
  const enabled = eligibleModels(all, guest);
  const pool = speedPool(enabled);
  const chosen: PanelModel[] = [];
  const c = choice ?? 'mixed';

  if (Array.isArray(c)) {
    if (c.length < 2 || c.length > 3) return { ok: false, error: 'panel must list 2 or 3 model ids.' };
    if (new Set(c).size !== c.length) return { ok: false, error: 'panel model ids must be distinct.' };
    for (const id of c) {
      const m = enabled.find((x) => x.model_id === id);
      const known = all.find((x) => x.model_id === id);
      if (!m && known) return { ok: false, error: guestBlockedError(known) };
      if (!m) return { ok: false, error: `Model "${id}" is not an enabled SiliconSoap model. Call list_panel_models.` };
      chosen.push(m);
    }
    return { ok: true, models: chosen };
  }

  if (c === 'mixed') {
    // Port of orderedFastCast: one EU, one US, one CN open-weight model, cheapest first.
    const open = pool.filter((m) => m.license_type === 'open-weight');
    for (const origin of ['EU', 'US', 'CN']) add(chosen, open.find((m) => m.origin_region === origin && !chosen.includes(m)));
    for (const m of open) { if (chosen.length === 3) break; add(chosen, m); }
    for (const m of pool) { if (chosen.length === 3) break; add(chosen, m); }
  } else if (c === 'eu') {
    for (const m of pool.filter((m) => m.origin_region === 'EU')) { if (chosen.length === 3) break; add(chosen, m); }
  } else if (c === 'open-weights') {
    for (const m of pool.filter((m) => m.license_type === 'open-weight')) {
      if (chosen.length === 3) break;
      if (!chosen.some((x) => x.provider.toLowerCase() === m.provider.toLowerCase())) add(chosen, m);
    }
  } else {
    return { ok: false, error: `Unknown panel "${c}". Use 'mixed', 'eu', 'open-weights' or 2-3 model ids.` };
  }

  if (chosen.length < 2) return { ok: false, error: `Not enough enabled models for panel "${c}".` };
  return { ok: true, models: chosen };
}

export const shortName = (display: string) => display.replace(/^[^:]+:\s*/, '');

// ---------- Synthesis ----------
export interface Answer {
  model: string; display_name: string; origin: string | null; license: string | null;
  round: number; text: string; answered_by_model: string | null;
}

export interface Synthesis {
  bottom_line: string;
  confidence: 'high' | 'medium' | 'low';
  agreements: string[];
  disagreements: { point: string; positions: { model: string; stance: string }[] }[];
  unsourced_numbers: { claim: string; model: string }[];
  positions: { model: string; display_name: string; origin: string | null; license: string | null; stance: string; answered_by?: string[] }[];
  draft_verdict?: 'holds' | 'needs_changes' | 'wrong';
  key_fixes?: string[];
  synthesis_fallback?: boolean;
}

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
const strArr = (v: unknown) => (Array.isArray(v) ? v.map(str).filter(Boolean) : null);

/** Extract a JSON object from model output (handles ```json fences and surrounding prose). */
export function extractJson(raw: string): unknown {
  const cleaned = raw.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '').replace(/```(?:json)?/gi, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try { return JSON.parse(cleaned.slice(start, end + 1)); } catch { return null; }
}

/** Returns a validated synthesis or null. Positions are rebuilt from the panel so metadata is trustworthy. */
export function validateSynthesis(value: unknown, panel: PanelModel[], reviewMode: boolean): Synthesis | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, any>;
  const bottom = str(v.bottom_line);
  const conf = v.confidence;
  const agreements = strArr(v.agreements);
  if (!bottom || !['high', 'medium', 'low'].includes(conf) || !agreements) return null;
  if (!Array.isArray(v.disagreements) || !Array.isArray(v.positions)) return null;

  const disagreements = v.disagreements
    .filter((d: any) => d && str(d.point))
    .map((d: any) => ({
      point: str(d.point),
      positions: Array.isArray(d.positions)
        ? d.positions.filter((p: any) => str(p?.model) && str(p?.stance)).map((p: any) => ({ model: str(p.model), stance: str(p.stance) }))
        : [],
    }));
  const unsourced = Array.isArray(v.unsourced_numbers)
    ? v.unsourced_numbers.filter((u: any) => str(u?.claim)).map((u: any) => ({ claim: str(u.claim), model: str(u.model) }))
    : [];
  const positions = panel.map((m) => {
    const hit = v.positions.find((p: any) => str(p?.model) === m.model_id || str(p?.display_name) === m.display_name || str(p?.display_name) === shortName(m.display_name));
    return { model: m.model_id, display_name: shortName(m.display_name), origin: m.origin_region, license: m.license_type, stance: str(hit?.stance) };
  });
  if (positions.every((p) => !p.stance)) return null;

  const out: Synthesis = { bottom_line: bottom, confidence: conf, agreements, disagreements, unsourced_numbers: unsourced, positions };
  if (reviewMode) {
    if (!['holds', 'needs_changes', 'wrong'].includes(v.draft_verdict)) return null;
    out.draft_verdict = v.draft_verdict;
    out.key_fixes = strArr(v.key_fixes) ?? [];
  }
  return out;
}

const firstSentence = (text: string) => {
  const t = text.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '').replace(/\s+/g, ' ').trim();
  const m = t.match(/^(.{1,280}?[.!?])(\s|$)/);
  return (m ? m[1] : t.slice(0, 200)).trim();
};

/** Minimal synthesis built from the answers when the judge output is unusable. */
export function fallbackSynthesis(panel: PanelModel[], answers: Answer[], reviewMode: boolean): Synthesis {
  const finalRound = Math.max(...answers.map((a) => a.round), 1);
  const positions = panel.map((m) => {
    const a = answers.filter((x) => x.model === m.model_id).sort((x, y) => y.round - x.round)[0];
    return { model: m.model_id, display_name: shortName(m.display_name), origin: m.origin_region, license: m.license_type, stance: a ? firstSentence(a.text) : '' };
  });
  const out: Synthesis = {
    bottom_line: `The panel's automatic synthesis was unavailable; read the ${answers.filter((a) => a.round === finalRound).length} final answers below and weigh them yourself.`,
    confidence: 'low',
    agreements: [],
    disagreements: [],
    unsourced_numbers: [],
    positions,
    synthesis_fallback: true,
  };
  if (reviewMode) { out.draft_verdict = 'needs_changes'; out.key_fixes = []; }
  return out;
}

// ---------- Keys ----------
const BASE62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export const GUEST_KEY_RE = /^sk_guest_[A-Za-z0-9]{32}$/;
export const ACCOUNT_KEY_RE = /^sk_silicon_[A-Za-z0-9]+$/;

export function generateGuestKey(): string {
  const out: string[] = [];
  const buf = new Uint8Array(64);
  while (out.length < 32) {
    crypto.getRandomValues(buf);
    for (const b of buf) {
      if (b < 248 && out.length < 32) out.push(BASE62[b % 62]); // 248 = 62*4, no modulo bias
    }
  }
  return `sk_guest_${out.join('')}`;
}

export const keyPrefix = (key: string) => key.slice(0, 12);

export async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export type Caller = { kind: 'guest'; guestKeyId: string } | { kind: 'account'; userId: string };

/** A panel is visible only to the guest key or account that created it. */
export function ownsPanel(caller: Caller, chat: { user_id: string | null; guest_key_id: string | null }): boolean {
  if (caller.kind === 'guest') return !!chat.guest_key_id && chat.guest_key_id === caller.guestKeyId;
  return !!chat.user_id && chat.user_id === caller.userId;
}

/** Interprets use_guest_key_credit's return value. */
export const guestCreditResult = (n: number | null | undefined) =>
  typeof n === 'number' && n >= 0 ? { ok: true as const, remaining: n } : { ok: false as const, remaining: 0 };

const TOP_TIER = 'elite';
const GUEST_MAX_OUTPUT_PER_TOKEN = 6 / 1_000_000;
const EU_GUEST_FALLBACK = /mistral-medium-3[.-]5/i;
/** Guests get everything except the top tier and models costing >= $6 per 1M output tokens. Unknown tiers are blocked. */
export const guestAllowed = (m: PanelModel) =>
  !!m.price_tier && m.price_tier !== TOP_TIER && !(typeof m.price_output === 'number' && m.price_output >= GUEST_MAX_OUTPUT_PER_TOKEN);
export const eligibleModels = (models: PanelModel[], guest: boolean) => guest ? models.filter(guestAllowed) : models;
/** Guest fallback roster: guest-eligible models plus Mistral Medium 3.5 flagged as EU-fallback-only. */
export const guestFallbackRoster = (models: PanelModel[]) => [
  ...models.filter(guestAllowed),
  ...models.filter((m) => !guestAllowed(m) && m.origin_region === 'EU' && EU_GUEST_FALLBACK.test(m.model_id)).map((m) => ({ ...m, eu_fallback_only: true })),
];
export const guestBlockedError = (m: PanelModel) =>
  `Model "${m.model_id}" needs an account (${m.price_tier || 'unknown tier'}). Sign up at siliconsoap.com or choose a budget/standard model from list_panel_models.`;
export const validBatch = (body: unknown) => !Array.isArray(body) || (body.length > 0 && body.length <= 5);
export function fallbackCandidates(choice: PanelChoice | undefined, seat: PanelModel, panel: PanelModel[], roster: PanelModel[]): PanelModel[] {
  const euFirst = (list: PanelModel[]) => [...list].sort((a, b) => Number(EU_GUEST_FALLBACK.test(b.model_id)) - Number(EU_GUEST_FALLBACK.test(a.model_id)));
  const available = speedPool(roster).filter(m => !panel.some(p => p.model_id === m.model_id))
    .filter(m => !m.eu_fallback_only || seat.origin_region === 'EU');
  if (choice === 'eu') return euFirst(available.filter(m => m.origin_region === 'EU'));
  if (choice === 'open-weights') return available.filter(m => m.license_type === 'open-weight' && !m.eu_fallback_only);
  const same = available.filter(m => m.origin_region === seat.origin_region);
  return [...(seat.origin_region === 'EU' ? euFirst(same) : same), ...available.filter(m => m.origin_region !== seat.origin_region && m.speed_rating === 'fast')];
}
export interface FallbackEvent { seat: string; by: string | null; round: number }
/** One note per seat + responder, with merged rounds. `by: null` means the seat was dropped. */
export function fallbackNotes(events: FallbackEvent[], name: (id: string) => string): string[] {
  const groups = new Map<string, FallbackEvent[]>();
  for (const e of events) { const k = `${e.seat}|${e.by ?? ''}`; groups.set(k, [...(groups.get(k) ?? []), e]); }
  return [...groups.values()].map((g) => {
    const rounds = [...new Set(g.map((e) => e.round))].sort((a, b) => a - b);
    const r = rounds.length === 1 ? `round ${rounds[0]}` : rounds.every((x, i) => i === 0 || x === rounds[i - 1] + 1) ? `rounds ${rounds[0]}–${rounds[rounds.length - 1]}` : `rounds ${rounds.join(', ')}`;
    return g[0].by
      ? `${name(g[0].seat)} was answered by ${name(g[0].by)} in ${r} (constrained fallback).`
      : `${name(g[0].seat)}: seat dropped in ${r}; no allowed fallback responded.`;
  });
}
/** Detects HTTP 429 or a provider rate-limit error in an OpenRouter response. */
export const isRateLimited = (status: number, data: any) =>
  status === 429 || data?.error?.code === 429 || /rate.?limit|too many requests/i.test(String(data?.error?.message ?? '') + String(data?.error?.metadata?.raw ?? ''));
export async function chargedPanel<T extends { ok: boolean; result?: { answers: unknown[] } }>(run: () => Promise<T>, refund: () => Promise<void>): Promise<T> {
  let out: T;
  try { out = await run(); }
  catch (e) { await refund(); throw e; }
  if (!out.ok || !out.result?.answers.length) await refund();
  return out;
}
export function attributeSynthesis(s: Synthesis, answers: Answer[], roster: PanelModel[]): Synthesis {
  const actualFor = (id: string) => answers.filter(a => a.model === id).slice(-1)[0]?.answered_by_model ?? id;
  s.disagreements = s.disagreements.map(d => ({ ...d, positions: d.positions.map(p => ({ ...p, model: actualFor(p.model) })) }));
  s.unsourced_numbers = s.unsourced_numbers.map(n => ({ ...n, model: actualFor(n.model) }));
  s.positions = s.positions.map(p => {
    const turns = answers.filter(a => a.model === p.model);
    const actual = turns.filter(a => a.answered_by_model).map(a => a.answered_by_model as string);
    if (!actual.length) return p;
    const last = turns[turns.length - 1];
    const m = roster.find(m => m.model_id === last?.answered_by_model);
    return { ...p, answered_by: [...new Set(actual)], ...(m ? { display_name: shortName(m.display_name), origin: m.origin_region, license: m.license_type } : {}), stance: last?.answered_by_model ? firstSentence(last.text) : p.stance };
  });
  return s;
}
