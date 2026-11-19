import { assertEquals, assert } from "jsr:@std/assert@1";
import { orderedMessageTimestamps } from "./messageOrder.ts";

Deno.test("message timestamps keep the client's display order", () => {
  const now = Date.parse("2026-11-19T16:06:00.000Z");
  const stamps = orderedMessageTimestamps(4, now);
  assertEquals(stamps, [
    "2026-11-19T16:05:59.996Z",
    "2026-11-19T16:05:59.997Z",
    "2026-11-19T16:05:59.998Z",
    "2026-11-19T16:05:59.999Z",
  ]);
});

Deno.test("message timestamps are one millisecond apart and strictly increasing", () => {
  const stamps = orderedMessageTimestamps(6, Date.now());
  assertEquals(stamps.length, 6);
  for (let i = 1; i < stamps.length; i++) {
    const gap = Date.parse(stamps[i]) - Date.parse(stamps[i - 1]);
    assertEquals(gap, 1);
    assert(stamps[i] > stamps[i - 1]);
  }
});

Deno.test("message timestamps are never in the future", () => {
  const now = Date.now();
  const stamps = orderedMessageTimestamps(3, now);
  assert(Date.parse(stamps[stamps.length - 1]) < now);
});

Deno.test("empty message lists produce no timestamps", () => {
  assertEquals(orderedMessageTimestamps(0, Date.now()), []);
});
