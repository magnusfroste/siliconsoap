import { assert, assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import {
  buildAllowlist, isModelAllowed, clampMaxTokens, capBoostedTokens,
  validateMessages, validateTts, hashIp, getClientIp,
} from '../_shared/requestGuards.ts';

Deno.test('allowlist: curated, judge, coordinator and fallback allowed; others not', () => {
  const s = buildAllowlist(['z-ai/glm-4.5'], 'google/gemini-2.5-flash');
  assert(isModelAllowed('z-ai/glm-4.5', s));
  assert(isModelAllowed('google/gemini-2.5-flash', s));
  assert(isModelAllowed('anthropic/claude-3.5-sonnet', s));
  assert(isModelAllowed('openai/gpt-4o-mini', s));
  assert(!isModelAllowed('openai/o1-pro', s));
  assert(!isModelAllowed(undefined, s));
});

Deno.test('max_tokens clamped to 1200, boost capped at 7200', () => {
  assertEquals(clampMaxTokens(700, 700), 700);
  assertEquals(clampMaxTokens(1200, 700), 1200);
  assertEquals(clampMaxTokens(100000, 700), 1200);
  assertEquals(clampMaxTokens(undefined, 700), 700);
  assertEquals(capBoostedTokens(50000), 7200);
  assertEquals(capBoostedTokens(4200), 4200);
});

Deno.test('messages: 1-60 items and at most 150,000 chars', () => {
  assert(!validateMessages([]).ok);
  assert(!validateMessages('x').ok);
  assert(validateMessages([{ role: 'user', content: 'hi' }]).ok);
  assert(validateMessages(Array(60).fill({ role: 'user', content: 'a' })).ok);
  assert(!validateMessages(Array(61).fill({ role: 'user', content: 'a' })).ok);
  assert(validateMessages([{ role: 'user', content: 'a'.repeat(150000) }]).ok);
  assert(!validateMessages([{ role: 'user', content: 'a'.repeat(150001) }]).ok);
});

Deno.test('tts: text <= 5000, voice id format', () => {
  assert(validateTts('hello', 'EXAVITQu4vr4xnSDxMaL'));
  assert(!validateTts('a'.repeat(5001), 'EXAVITQu4vr4xnSDxMaL'));
  assert(!validateTts('hello', '../etc'));
  assert(!validateTts('hello', 'short'));
});

Deno.test('ip hashing is sha-256 hex and never the raw ip', async () => {
  const h = await hashIp('1.2.3.4');
  assertEquals(h.length, 64);
  assertEquals(h, await hashIp('1.2.3.4'));
  assert(!h.includes('1.2.3.4'));
  assertEquals(getClientIp(new Headers({ 'x-forwarded-for': '9.9.9.9, 1.1.1.1' })), '9.9.9.9');
  assertEquals(getClientIp(new Headers({ 'cf-connecting-ip': '5.5.5.5', 'x-real-ip': '6.6.6.6' })), '5.5.5.5');
});

import { isAnonCaller, resolveGuestDailyLimit } from '../_shared/requestGuards.ts';
Deno.test('anon caller: missing bearer or anon key; user JWT is not anon', () => {
  assert(isAnonCaller('', 'anon'));
  assert(isAnonCaller('anon', 'anon'));
  assert(!isAnonCaller('user.jwt.token', 'anon'));
});
Deno.test('guest daily limit: flag value, else 400', () => {
  assertEquals(resolveGuestDailyLimit({ enabled: true, numeric_value: 250 }), 250);
  assertEquals(resolveGuestDailyLimit({ enabled: false, numeric_value: 250 }), 400);
  assertEquals(resolveGuestDailyLimit(null), 400);
});
