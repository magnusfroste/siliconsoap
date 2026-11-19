/**
 * Batch inserts share one statement timestamp, so the public transcript (ordered
 * by created_at) would show messages in arbitrary order. Give every message an
 * explicit, strictly increasing timestamp that keeps the client's display order.
 */
export function orderedMessageTimestamps(count: number, now: number): string[] {
  if (!Number.isFinite(count) || count <= 0) return [];
  const base = now - count;
  return Array.from({ length: count }, (_, index) => new Date(base + index).toISOString());
}
