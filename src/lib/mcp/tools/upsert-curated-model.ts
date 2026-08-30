import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, isAdmin, ok, requireAuth, supabaseForUser } from "../supabase";

export default defineTool({
  name: "upsert_curated_model",
  title: "Add or update a curated model",
  description:
    "Admin only. Add a new model to SiliconSoap's curated roster, or update an existing one (enabled state, reasoning toggle, metadata, pricing tier, sort order). Use `list_openrouter_models` first to get the exact model id.",
  inputSchema: {
    model_id: z.string().describe("OpenRouter model id, e.g. 'anthropic/claude-sonnet-4.5'."),
    display_name: z.string().optional().describe("Name shown in the UI. Required for new models."),
    provider: z.string().optional().describe("Provider label. Required for new models."),
    description: z.string().optional(),
    category: z.string().optional(),
    license_type: z.string().optional().describe("e.g. 'open-weights' or 'proprietary'."),
    speed_rating: z.string().optional(),
    price_tier: z.string().optional(),
    context_window: z.number().int().optional(),
    is_free: z.boolean().optional(),
    is_enabled: z.boolean().optional().describe("Whether users can select this model."),
    supports_reasoning: z
      .boolean()
      .optional()
      .describe("Whether the model supports reasoning at all (from OpenRouter)."),
    disable_reasoning: z
      .boolean()
      .optional()
      .describe("Turn hidden thinking OFF for this model in debates."),
    sort_order: z.number().int().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    requireAuth(ctx);
    if (!(await isAdmin(ctx))) return fail("Admin role required.");
    const supabase = supabaseForUser(ctx);

    const { data: existing, error: readErr } = await supabase
      .from("curated_models")
      .select("id, model_id")
      .eq("model_id", input.model_id)
      .maybeSingle();
    if (readErr) return fail(readErr.message);

    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      if (key !== "model_id" && value !== undefined) patch[key] = value;
    }

    if (existing) {
      const { data, error } = await supabase
        .from("curated_models")
        .update(patch)
        .eq("id", existing.id)
        .select()
        .maybeSingle();
      if (error) return fail(error.message);
      return ok({ action: "updated", model: data });
    }

    if (!input.display_name || !input.provider) {
      return fail("New models require both `display_name` and `provider`.");
    }
    const { data, error } = await supabase
      .from("curated_models")
      .insert({ model_id: input.model_id, ...patch })
      .select()
      .maybeSingle();
    if (error) return fail(error.message);
    return ok({ action: "created", model: data });
  },
});
