import { describe, expect, it } from 'vitest';
import { withRounds, numberClaims, type SharedMsg } from '../debatePresentation';

const message = (agent: string, text = 'An answer.', isHuman = false): SharedMsg => ({ agent, message: text, persona: 'analytical', model: 'test/model', isHuman });

describe('debate presentation', () => {
  it('walks agent letters rather than dividing message indexes', () => {
    const entries = withRounds([message('Agent B'), message('Agent A'), message('Agent C'), message('Agent C'), message('Agent B'), message('Agent A')]);
    expect(entries.map(entry => entry.round)).toEqual([1, 1, 1, 2, 2, 2]);
  });
  it('keeps human replies in the current round without consuming an agent slot', () => {
    const entries = withRounds([message('Agent A'), message('Agent B'), message('You', 'My view.', true), message('Agent B'), message('Agent A')]);
    expect(entries.map(entry => entry.round)).toEqual([1, 1, 1, 2, 2]);
    expect(entries[2].isUser).toBe(true);
  });
  it('flags public numbers, not private reasoning or linked answers', () => {
    const entries = withRounds([message('Agent A', '<thinking>99% secret.</thinking>Public costs rose 20%.'), message('Agent B', '30% according to https://example.org')]);
    expect(numberClaims(entries).map(claim => claim.sentence)).toEqual(['Public costs rose 20%.']);
  });
});
import { isDebateComplete } from '../debatePresentation';
describe('isDebateComplete', () => {
  it('3 agents x 3 rounds', () => {
    expect(isDebateComplete(7, 3, 3)).toBe(false);
    expect(isDebateComplete(8, 3, 3)).toBe(false);
    expect(isDebateComplete(9, 3, 3)).toBe(true);
  });
  it('2 agents x 1 round', () => {
    expect(isDebateComplete(1, 2, 1)).toBe(false);
    expect(isDebateComplete(2, 2, 1)).toBe(true);
  });
});
