import { describe, expect, it } from 'vitest';
import { shuffleSlots } from '../slotShuffle';

const IDS: [string, string, string] = ['eu/mistral', 'us/llama', 'cn/qwen'];

const sorted = (list: string[]) => [...list].sort();

describe('shuffleSlots', () => {
  it('returns a permutation of the input for many injected random sequences', () => {
    const sequences = [
      () => 0,
      () => 0.999999,
      () => 0.5,
      () => 0.25,
      () => 0.75,
      () => 0.0001,
    ];
    for (const random of sequences) {
      const result = shuffleSlots(IDS, random);
      expect(result).toHaveLength(3);
      expect(sorted(result)).toEqual(sorted(IDS));
    }
  });

  it('keeps the input order when random always returns the highest value', () => {
    expect(shuffleSlots(IDS, () => 0.999999)).toEqual(IDS);
  });

  it('moves a model other than the first input into slot A', () => {
    // random always 0 => i=2 swaps slots 2 and 0, i=1 swaps slots 1 and 0.
    expect(shuffleSlots(IDS, () => 0)).toEqual(['us/llama', 'cn/qwen', 'eu/mistral']);
    expect(shuffleSlots(IDS, () => 0)[0]).not.toBe(IDS[0]);
  });

  it('can put every input model in slot A across the full random range', () => {
    const slotA = new Set<string>();
    const steps = 20;
    for (let s = 0; s < steps; s++) {
      const value = s / steps;
      slotA.add(shuffleSlots(IDS, () => value)[0]);
    }
    expect(sorted([...slotA])).toEqual(sorted(IDS));
  });

  it('does not mutate the input array', () => {
    const input: [string, string, string] = ['a', 'b', 'c'];
    shuffleSlots(input, () => 0);
    expect(input).toEqual(['a', 'b', 'c']);
  });

  it('defaults to Math.random and still returns a permutation', () => {
    expect(sorted(shuffleSlots(IDS))).toEqual(sorted(IDS));
  });
});
