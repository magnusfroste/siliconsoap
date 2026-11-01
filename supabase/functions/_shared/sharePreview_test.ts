import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { buildShareDescription, modelLabels, truncate } from "./sharePreview.ts";

Deno.test("description lists models with vs and stays under 200 chars", () => {
  const d = buildShareDescription({
    prompt: "Should we move our customer database from a US cloud to an EU provider this year? ".repeat(5),
    models: ["Mistral Medium 3.5", "Nemotron 3 Nano", "GLM 4.7 Flash"],
    isPanel: false,
    hasContent: true,
  });
  assert(d.startsWith("Mistral Medium 3.5 vs Nemotron 3 Nano vs GLM 4.7 Flash debate: Should we"));
  assert(d.length <= 200);
});

Deno.test("description without content is just the prompt", () => {
  assertEquals(buildShareDescription({ prompt: "Hi there", models: ["A"], isPanel: false, hasContent: false }), "Hi there");
});

Deno.test("panels are labelled as panels", () => {
  const d = buildShareDescription({ prompt: "Q?", models: ["A", "B"], isPanel: true, hasContent: true });
  assertEquals(d, "A vs B panel: Q?");
});

Deno.test("model labels use display names and dedupe", () => {
  assertEquals(modelLabels(["z-ai/glm-4.7-flash", "x/y:free", "z-ai/glm-4.7-flash"], { "z-ai/glm-4.7-flash": "Z.ai: GLM 4.7 Flash" }), ["GLM 4.7 Flash", "y"]);
});

Deno.test("truncate adds an ellipsis", () => {
  const t = truncate("one two three four five six", 15);
  assert(t.length <= 15 && t.endsWith("…"));
});
