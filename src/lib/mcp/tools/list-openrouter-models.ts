import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, supabaseAnon } from "../supabase";

interface OpenRouterModel {
  id: string;
  name?: string;
  created?: number;
  context_length?: number;
  pricing?: { prompt?: string; completion?: string };
  supported_parameters?: string[];
}

export default defineTool({
  name: "list_openrouter_models",
  title: "Browse OpenRouter catalog",
  description:
    "Browse the live OpenRouter model catalog to discover newly released models, and see which of them are not yet curated on SiliconSoap. Use before `upsert_curated_model`.",
  inputSchema: {
    search: z
      .string()
      .optional()
      .describe("Filter on model id or name, e.g. 'claude', 'qwen', 'free'."),
    only_new: z
      .boolean()
      .optional()
      .describe("Only return models that are not already curated on SiliconSoap."),
    limit: z.number().int().optional().describe("1-60, default 30."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ search, only_new, limit }) => {
    const res = await fetch("https://openrouter.ai/api/v1/models");
    if (!res.ok) return fail(`OpenRouter catalog request failed (${res.status}).`);
    const payload = (await res.json()) as { data?: OpenRouterModel[] };
    let models = payload.data ?? [];

    const { data: curated, error } = await supabaseAnon()
      .from("curated_models")
      .select("model_id");
    if (error) return fail(error.message);
    const known = new Set((curated ?? []).map((m) => m.model_id));

    const term = search?.trim().toLowerCase();
    if (term) {
      models = models.filter(
        (m) =>
          m.id.toLowerCase().includes(term) ||
          (m.name ?? "").toLowerCase().includes(term),
      );
    }
    if (only_new) models = models.filter((m) => !known.has(m.id));

    models.sort((a, b) => (b.created ?? 0) - (a.created ?? 0));
    const take = Math.min(Math.max(limit ?? 30, 1), 60);

    return ok({
      count: Math.min(models.length, take),
      total_matched: models.length,
      models: models.slice(0, take).map((m) => ({
        model_id: m.id,
        name: m.name,
        released: m.created ? new Date(m.created * 1000).toISOString() : null,
        context_window: m.context_length ?? null,
        price_input: m.pricing?.prompt ? Number(m.pricing.prompt) : null,
        price_output: m.pricing?.completion ? Number(m.pricing.completion) : null,
        supports_reasoning: (m.supported_parameters ?? []).includes("reasoning"),
        already_curated: known.has(m.id),
      })),
    });
  },
});
