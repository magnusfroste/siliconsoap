export const GUEST_LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000;

/** Missing keys preserve legacy saves; supplied keys must be nonempty and bounded. */
export function validClientKey(value: unknown): boolean {
  return value === undefined || (typeof value === "string" && value.length > 0 && value.length <= 64);
}

export function guestLookupSince(clientKey: unknown, now: number): string | null {
  return typeof clientKey === "string" && validClientKey(clientKey)
    ? new Date(now - GUEST_LOOKBACK_MS).toISOString()
    : null;
}