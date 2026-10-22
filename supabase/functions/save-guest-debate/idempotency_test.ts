import { assertEquals } from "jsr:@std/assert@1";
import { guestLookupSince, validClientKey } from "./idempotency.ts";

Deno.test("client key looks back exactly seven days", () => {
  assertEquals(guestLookupSince("guest_123", Date.parse("2026-10-22T23:30:00Z")), "2026-10-15T23:30:00.000Z");
});
Deno.test("missing client key preserves legacy inserts", () => {
  assertEquals(validClientKey(undefined), true);
  assertEquals(guestLookupSince(undefined, Date.now()), null);
});
Deno.test("client key must be a nonempty string of at most 64 characters", () => {
  assertEquals(validClientKey("x".repeat(64)), true);
  for (const value of ["x".repeat(65), "", 42, null, {}]) {
    assertEquals(validClientKey(value), false);
    assertEquals(guestLookupSince(value, Date.now()), null);
  }
});