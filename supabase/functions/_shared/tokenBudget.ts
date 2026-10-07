// Shared token budget for all debate engines (openrouter-chat, seed-debates, debates-api).
// BASE_MAX_TOKENS mirrors getMaxTokens in src/utils/openRouter/constants.ts.
export const BASE_MAX_TOKENS = { short: 400, medium: 700, long: 1200 } as const;
export type ResponseLength = keyof typeof BASE_MAX_TOKENS;

// Headroom for hidden reasoning so the visible reply is not truncated.
export const REASONING_BUFFER = 1500;

export function baseMaxTokens(responseLength?: string | null): number {
  return BASE_MAX_TOKENS[(responseLength ?? "medium") as ResponseLength] ?? BASE_MAX_TOKENS.medium;
}

export function effectiveMaxTokens(responseLength: string | null | undefined, disableReasoning: boolean): number {
  const base = baseMaxTokens(responseLength);
  return disableReasoning ? base : base + REASONING_BUFFER;
}
