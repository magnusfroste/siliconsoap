import { assertEquals } from "jsr:@std/assert@1";
import { sanitizeAnsweredBy } from "./answeredBy.ts";

Deno.test("accepts a valid model id", () => assertEquals(sanitizeAnsweredBy("openai/gpt-4o-mini"), "openai/gpt-4o-mini"));
Deno.test("accepts ids with a :free suffix", () => assertEquals(sanitizeAnsweredBy("meta-llama/llama-3.3-70b:free"), "meta-llama/llama-3.3-70b:free"));
Deno.test("rejects non-strings", () => { assertEquals(sanitizeAnsweredBy(42), null); assertEquals(sanitizeAnsweredBy(undefined), null); });
Deno.test("rejects ids without a provider slash", () => assertEquals(sanitizeAnsweredBy("gpt-4o-mini"), null));
Deno.test("rejects markup", () => assertEquals(sanitizeAnsweredBy("openai/<script>"), null));
Deno.test("rejects ids over 120 chars", () => assertEquals(sanitizeAnsweredBy("a/" + "b".repeat(119)), null));
Deno.test("accepts exactly 120 chars", () => assertEquals(sanitizeAnsweredBy("a/" + "b".repeat(118))?.length, 120));
