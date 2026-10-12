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

export function resolvePanel(choice: PanelChoice | undefined, enabled: PanelModel[]): Resolution {
  const pool = speedPool(enabled);
  const chosen: PanelModel[] = [];
  const c = choice ?? 'mixed';

  if (Array.isArray(c)) {
    if (c.length < 2 || c.length > 3) return { ok: false, error: 'panel must list 2 or 3 model ids.' };
    if (new Set(c).size !== c.length) return { ok: false, error: 'panel model ids must be distinct.' };
    for (const id of c) {
      const m = enabled.find((x) => x.model_id === id);
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
  positions: { model: string; display_name: string; origin: string | null; license: string | null; stance: string }[];
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
