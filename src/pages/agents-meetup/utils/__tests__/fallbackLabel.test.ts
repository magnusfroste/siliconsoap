import { describe, it, expect } from 'vitest';
import { fallbackChipLabel, fallbackTurnsNote, toMessageInsert, answeredByOf } from '../fallbackLabel';
import type { ConversationMessage } from '@/models/conversation';

const names = { 'mistralai/mistral-small-4': 'Mistral: Mistral Small 4' };

describe('fallbackChipLabel', () => {
  it('uses curated names without provider prefix and GPT-4o-mini for the fallback', () => {
    expect(fallbackChipLabel('openai/gpt-4o-mini', 'mistralai/mistral-small-4', names))
      .toBe('Answered by GPT-4o-mini · Mistral Small 4 was unavailable');
  });
  it('falls back to the raw id for unknown models', () => {
    expect(fallbackChipLabel('openai/gpt-4o-mini', 'x/unknown')).toBe('Answered by GPT-4o-mini · x/unknown was unavailable');
  });
});

describe('answeredByOf / fallbackTurnsNote', () => {
  it('ignores null and same-model values', () => {
    expect(answeredByOf({ model: 'a/b', answered_by_model: null })).toBeNull();
    expect(answeredByOf({ model: 'a/b', answeredByModel: 'a/b' })).toBeNull();
  });
  it('counts fallback turns per model', () => {
    const msgs = [{ model: 'm/s' , answered_by_model: 'openai/gpt-4o-mini' }, { model: 'm/s', answered_by_model: 'openai/gpt-4o-mini' }, { model: 'm/s' }, { model: 'o/x' }];
    expect(fallbackTurnsNote(msgs, 'm/s')).toBe('2 of 3 turns answered by a fallback model');
    expect(fallbackTurnsNote(msgs, 'o/x')).toBeNull();
  });
});

describe('toMessageInsert', () => {
  it('carries answeredByModel from a ConversationMessage into the insert payload', () => {
    const msg: ConversationMessage = { agent: 'Agent A', message: 'hi', model: 'mistralai/mistral-small-4', persona: 'analytical', answeredByModel: 'openai/gpt-4o-mini' };
    expect(toMessageInsert('chat-1', msg)).toEqual({ chat_id: 'chat-1', agent: 'Agent A', message: 'hi', model: 'mistralai/mistral-small-4', persona: 'analytical', answered_by_model: 'openai/gpt-4o-mini' });
  });
  it('stores null when the cast model answered', () => {
    expect(toMessageInsert('c', { agent: 'Agent B', message: 'x', model: 'a/b', persona: 'p' }).answered_by_model).toBeNull();
  });
});
