import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { resolveCheckoutOrigin } from "./origin.ts";

Deno.test("missing origin falls back to siliconsoap.com", () => {
  assertEquals(resolveCheckoutOrigin(null), "https://siliconsoap.com");
});
Deno.test("own and www origins are kept", () => {
  assertEquals(resolveCheckoutOrigin("https://siliconsoap.com"), "https://siliconsoap.com");
  assertEquals(resolveCheckoutOrigin("https://www.siliconsoap.com"), "https://www.siliconsoap.com");
});
Deno.test("lovable preview origins are kept", () => {
  const o = "https://id-preview--29828faf-1631-4559-8318-49f9c74c6d6d.lovable.app";
  assertEquals(resolveCheckoutOrigin(o), o);
});
Deno.test("foreign, dead or lookalike origins fall back", () => {
  for (const o of ["https://evil.com", "https://siliconsoap.app", "http://siliconsoap.com", "https://x.lovable.app.evil.com", "https://siliconsoap.com.evil.com"]) {
    assertEquals(resolveCheckoutOrigin(o), "https://siliconsoap.com");
  }
});
