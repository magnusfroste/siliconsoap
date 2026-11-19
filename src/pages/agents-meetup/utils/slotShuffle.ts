// Pure helper for assigning selected models to agent slots.

/**
 * Randomize which slot each selected model gets.
 *
 * Fisher-Yates (Durstenfeld) shuffle over a copy of the input: the result is
 * always a permutation of `ids`, and every input can land in any slot.
 * `random` is injectable so callers and tests can make the result deterministic.
 */
export const shuffleSlots = (
  ids: [string, string, string],
  random: () => number = Math.random,
): [string, string, string] => {
  const out = [...ids];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const swap = out[i];
    out[i] = out[j];
    out[j] = swap;
  }
  return out as [string, string, string];
};
