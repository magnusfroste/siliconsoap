import { assert, assertEquals, assertMatch } from 'jsr:@std/assert@1';
import {
  PanelModel, fallbackSynthesis, extractJson, generateGuestKey, guestCreditResult, keyPrefix,
  ownsPanel, resolvePanel, sha256Hex, validateSynthesis,
} from '../_shared/panelPure.ts';
import { validatePanelInput } from '../_shared/panelEngine.ts';

const m = (id: string, o: Partial<PanelModel>): PanelModel => ({
  model_id: id, display_name: `P: ${id}`, provider: id.split('/')[0], origin_region: 'US', license_type: 'open-weight',
  speed_rating: 'fast', price_tier: 'standard', sort_order: 1, disable_reasoning: false, ...o,
});
const roster = [
  m('mistral/small', { origin_region: 'EU', price_tier: 'standard' }),
  m('mistral/large', { origin_region: 'EU', price_tier: 'premium' }),
  m('nvidia/nano', { origin_region: 'US', price_tier: 'budget' }),
  m('nvidia/lightning', { origin_region: 'US', price_tier: 'budget', sort_order: 2 }),
  m('z-ai/flash', { origin_region: 'CN', price_tier: 'budget' }),
  m('anthropic/haiku', { license_type: 'closed' }),
  m('slow/model', { speed_rating: 'slow', origin_region: 'EU' }),
  m('meta/maverick', { speed_rating: 'medium', origin_region: 'EU' }),
];

Deno.test('mixed panel: one EU, US and CN open-weight fast model, cheapest first', () => {
  const r = resolvePanel('mixed', roster);
  assert(r.ok);
  assertEquals(r.models.map((x) => x.model_id), ['mistral/small', 'nvidia/nano', 'z-ai/flash']);
});

Deno.test('eu panel prefers fast, falls back to medium, never slow', () => {
  const r = resolvePanel('eu', roster);
  assert(r.ok);
  assertEquals(r.models.map((x) => x.model_id), ['mistral/small', 'mistral/large', 'meta/maverick']);
});

Deno.test('open-weights panel uses three different providers', () => {
  const r = resolvePanel('open-weights', roster);
  assert(r.ok);
  assertEquals(new Set(r.models.map((x) => x.provider)).size, 3);
  assert(r.models.every((x) => x.license_type === 'open-weight'));
});

Deno.test('explicit ids must be enabled curated models', () => {
  assert(resolvePanel(['nvidia/nano', 'z-ai/flash'], roster).ok);
  const bad = resolvePanel(['nvidia/nano', 'openai/o1-pro'], roster);
  assert(!bad.ok && bad.error.includes('openai/o1-pro'));
  assert(!resolvePanel(['nvidia/nano'], roster).ok);
});

Deno.test('input validation limits', () => {
  assert(!validatePanelInput({ question: '' }).ok);
  assert(!validatePanelInput({ question: 'x'.repeat(4001) }).ok);
  assert(!validatePanelInput({ question: 'q', draft: 'x'.repeat(8001) }).ok);
  assert(!validatePanelInput({ question: 'q', rounds: 3 }).ok);
  const ok = validatePanelInput({ question: 'q' });
  assert(ok.ok && ok.input.rounds === 2 && ok.input.panel === 'mixed');
});

const panel = roster.slice(0, 3);
const good = {
  bottom_line: 'Yes.', confidence: 'medium', agreements: ['a'],
  disagreements: [{ point: 'p', positions: [{ model: 'mistral/small', stance: 's' }] }],
  unsourced_numbers: [{ claim: '40%', model: 'nvidia/nano' }],
  positions: [{ model: 'mistral/small', stance: 'Agrees.' }],
};

Deno.test('synthesis JSON validation', () => {
  const s = validateSynthesis(extractJson('```json\n' + JSON.stringify(good) + '\n```'), panel, false);
  assert(s);
  assertEquals(s.positions.length, 3);
  assertEquals(s.positions[0].origin, 'EU');
  assertEquals(validateSynthesis({ ...good, confidence: 'certain' }, panel, false), null);
  assertEquals(validateSynthesis(good, panel, true), null); // review mode needs draft_verdict
  assert(validateSynthesis({ ...good, draft_verdict: 'wrong', key_fixes: ['x'] }, panel, true));
  assertEquals(extractJson('not json'), null);
});

Deno.test('fallback synthesis built from answers', () => {
  const s = fallbackSynthesis(panel, [
    { model: 'mistral/small', display_name: 'x', origin: 'EU', license: 'open-weight', round: 1, text: 'First. Second.', answered_by_model: null },
    { model: 'mistral/small', display_name: 'x', origin: 'EU', license: 'open-weight', round: 2, text: 'Changed my mind. More.', answered_by_model: null },
  ], true);
  assertEquals(s.confidence, 'low');
  assertEquals(s.positions[0].stance, 'Changed my mind.');
  assertEquals(s.draft_verdict, 'needs_changes');
  assert(s.synthesis_fallback);
});

Deno.test('guest key format, prefix and hash', async () => {
  const k = generateGuestKey();
  assertMatch(k, /^sk_guest_[A-Za-z0-9]{32}$/);
  assertEquals(keyPrefix(k), k.slice(0, 12));
  assert(generateGuestKey() !== k);
  assertEquals(await sha256Hex('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

Deno.test('guest credit decrement result', () => {
  assertEquals(guestCreditResult(4), { ok: true, remaining: 4 });
  assertEquals(guestCreditResult(0), { ok: true, remaining: 0 });
  assertEquals(guestCreditResult(-1).ok, false);
  assertEquals(guestCreditResult(null).ok, false);
});

Deno.test('a guest only sees their own panels', () => {
  const g = { kind: 'guest' as const, guestKeyId: 'k1' };
  assert(ownsPanel(g, { user_id: null, guest_key_id: 'k1' }));
  assert(!ownsPanel(g, { user_id: null, guest_key_id: 'k2' }));
  assert(!ownsPanel(g, { user_id: 'u1', guest_key_id: null }));
  const a = { kind: 'account' as const, userId: 'u1' };
  assert(ownsPanel(a, { user_id: 'u1', guest_key_id: null }));
  assert(!ownsPanel(a, { user_id: null, guest_key_id: 'k1' }));
});

Deno.test('EU fallback prefers Medium 3.5 and never leaves Europe', async () => {
  const { fallbackCandidates } = await import('../_shared/panelPure.ts');
  const extra = [m('mistralai/mistral-medium-3.5', { origin_region: 'EU' }), m('mistral/other', { origin_region: 'EU' })];
  const candidates = fallbackCandidates('eu', roster[0], roster.slice(0,3), [...roster, ...extra]);
  assertEquals(candidates[0].model_id, 'mistralai/mistral-medium-3.5');
  assert(candidates.every(m => m.origin_region === 'EU'));
  assertEquals(fallbackCandidates('eu', roster[0], roster, roster), []);
});
Deno.test('open-weight fallback never uses closed models; mixed prefers same origin', async () => {
  const { fallbackCandidates } = await import('../_shared/panelPure.ts');
  const cast = [roster[0], roster[2], roster[4]];
  assert(fallbackCandidates('open-weights', roster[0], cast, roster).every(m => m.license_type === 'open-weight'));
  assertEquals(fallbackCandidates('mixed', roster[0], cast, roster)[0].origin_region, 'EU');
  assertEquals(fallbackCandidates(['mistral/small','nvidia/nano'], roster[0], cast, roster)[0].origin_region, 'EU');
});
Deno.test('guest resolution and explicit choices exclude the top tier and unknown price tiers', async () => {
  const { eligibleModels } = await import('../_shared/panelPure.ts');
  const top = [...roster, m('anthropic/opus', { price_tier: 'elite' })];
  assert(!resolvePanel(['anthropic/opus','nvidia/nano'], top, true).ok);
  assert(resolvePanel(['anthropic/opus','nvidia/nano'], top, false).ok);
  assert(!eligibleModels([m('test/unknown',{ price_tier: null })], true).length);
  const r = resolvePanel('mixed', roster, true); assert(r.ok);
  assert(r.models.every(m => m.price_tier === 'budget' || m.price_tier === 'standard'));
});
Deno.test('guests: only the top tier and >= $6/1M output are blocked; Medium 3.5 is EU-fallback only', async () => {
  const { guestAllowed, guestFallbackRoster, fallbackCandidates } = await import('../_shared/panelPure.ts');
  assert(guestAllowed(m('z-ai/glm-5.1', { price_tier: 'premium', price_output: 0.000003036 })));
  assert(!guestAllowed(m('anthropic/claude-opus-5.5', { price_tier: 'elite', price_output: 0.00002 })));
  assert(!guestAllowed(m('x-ai/grok-4.6', { price_tier: 'premium', price_output: 0.000006 })));
  assert(!guestAllowed(m('openai/gpt-6-sol', { price_tier: 'premium', price_output: 0.00001 })));
  const medium = m('mistralai/mistral-medium-3-5', { origin_region: 'EU', price_tier: 'premium', price_output: 0.0000075, license_type: 'closed' });
  const all = [...roster, medium];
  const pick = resolvePanel(['mistralai/mistral-medium-3-5', 'nvidia/nano'], all, true);
  assert(!pick.ok); assertMatch(pick.error, /needs an account \(premium\)\. Sign up at siliconsoap\.com/);
  const fr = guestFallbackRoster(all);
  const eu = resolvePanel('eu', fr, true); assert(eu.ok); assert(!eu.models.some(x => x.model_id === medium.model_id));
  assertEquals(fallbackCandidates('eu', roster[0], [roster[0]], fr)[0].model_id, medium.model_id);
  const mixedEu = fallbackCandidates('mixed', roster[0], [roster[0], roster[2], roster[4]], fr);
  assertEquals(mixedEu[0].model_id, medium.model_id);
  const firstNonEu = mixedEu.findIndex(x => x.origin_region !== 'EU');
  assert(mixedEu.slice(firstNonEu).every(x => x.origin_region !== 'EU'));
  assert(!fallbackCandidates('mixed', roster[2], [roster[0], roster[2], roster[4]], fr).some(x => x.model_id === medium.model_id));
});
Deno.test('fallback notes merge rounds per seat', async () => {
  const { fallbackNotes } = await import('../_shared/panelPure.ts');
  const name = (id: string) => ({ 'mistralai/mistral-small-2603': 'Mistral Small 4', 'qwen/qwen3.8-flash': 'Qwen3.8 Flash' } as Record<string, string>)[id] ?? id;
  assertEquals(fallbackNotes([
    { seat: 'mistralai/mistral-small-2603', by: 'qwen/qwen3.8-flash', round: 1 },
    { seat: 'mistralai/mistral-small-2603', by: 'qwen/qwen3.8-flash', round: 2 },
  ], name), ['Mistral Small 4 was answered by Qwen3.8 Flash in rounds 1–2 (constrained fallback).']);
});
Deno.test('429 and provider rate-limit errors are detected for immediate failover', async () => {
  const { isRateLimited } = await import('../_shared/panelPure.ts');
  assert(isRateLimited(429, {}));
  assert(isRateLimited(200, { error: { code: 429, message: 'x' } }));
  assert(isRateLimited(502, { error: { message: 'Provider returned error', metadata: { raw: 'Rate limit exceeded' } } }));
  assert(!isRateLimited(500, { error: { message: 'boom' } }));
});
Deno.test('failed, empty and thrown panels refund exactly once; successful answers do not', async () => {
  const { chargedPanel } = await import('../_shared/panelPure.ts');
  let refunded = 0; const refund = async () => { refunded++; };
  await chargedPanel(async () => ({ ok: false }), refund); assertEquals(refunded, 1);
  await chargedPanel(async () => ({ ok: true, result: { answers: [] } }), refund); assertEquals(refunded, 2);
  try { await chargedPanel(async () => { throw new Error('failed'); }, refund); } catch { /* expected */ }
  assertEquals(refunded, 3);
  await chargedPanel(async () => ({ ok: true, result: { answers: ['answer'] } }), refund); assertEquals(refunded, 3);
});
Deno.test('RPC batches cap at five messages and reject empty batches', async () => {
  const { validBatch } = await import('../_shared/panelPure.ts');
  assert(validBatch(Array(5).fill({}))); assert(!validBatch(Array(6).fill({}))); assert(!validBatch([])); assert(validBatch({}));
});
Deno.test('synthesis fallback positions name actual answering model', async () => {
  const { attributeSynthesis } = await import('../_shared/panelPure.ts');
  const answers = [{ model: 'mistral/small', display_name: 'x', origin: 'EU', license: 'open-weight', round: 1, text: 'A fallback position.', answered_by_model: 'meta/maverick' }];
  const result = attributeSynthesis(fallbackSynthesis(panel, answers, false), answers, roster);
  assertEquals(result.positions[0].answered_by, ['meta/maverick']);
  assertEquals(result.positions[0].display_name, 'meta/maverick');
  assertEquals(result.positions[0].stance, 'A fallback position.');
});
Deno.test('a fallback model never answers two seats in the same round', async () => {
  const { claimDistinct } = await import('../_shared/panelPure.ts');
  const medium = m('mistralai/mistral-medium-3-5', { origin_region: 'EU' });
  const taken = new Set(['mistral/small', 'mistral/large']);
  assertEquals(claimDistinct([medium], taken)?.model_id, medium.model_id);
  assertEquals(claimDistinct([medium], taken), undefined); // second seat: dropped
  assertEquals(claimDistinct([medium, roster[7]], taken)?.model_id, 'meta/maverick');
});
Deno.test('fewer than 2 distinct round-1 models forces low confidence and a single-opinion note', async () => {
  const { applySingleOpinion, SINGLE_OPINION_NOTE } = await import('../_shared/panelPure.ts');
  const a = (model: string, by: string | null, round = 1) => ({ model, display_name: model, origin: 'EU', license: 'closed', round, text: 'x', answered_by_model: by });
  const s = { bottom_line: 'b', confidence: 'high', agreements: [], disagreements: [], unsourced_numbers: [], positions: [] } as any;
  const notes: string[] = [];
  assertEquals(applySingleOpinion(s, [a('mistral/small', 'mistral/medium')], notes).confidence, 'low');
  assertEquals(notes, [SINGLE_OPINION_NOTE]);
  const n2: string[] = [];
  assertEquals(applySingleOpinion(s, [a('mistral/small', null), a('mistral/large', 'mistral/medium')], n2).confidence, 'high');
  assertEquals(n2, []);
});
