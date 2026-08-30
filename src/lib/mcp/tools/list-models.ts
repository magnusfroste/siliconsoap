import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, supabaseAnon } from "../supabase";

export default defineTool({
  name: "list_models",
  title: "List curated models",
  description:
    "List the LLMs curated for SiliconSoap debates, with provider, pricing, reasoning support and whether they are enabled.",
  inputSchema: {
    include_disabled: z
      .boolean()
      .optional()
      .describe("Include models that are currently disabled in the app."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ include_disabled }) => {
    const supabase = supabaseAnon();
    let query = supabase
      .from("curated_models")
      .select(
        "model_id, display_name, provider, category, is_enabled, is_free, disable_reasoning, supports_reasoning, price_input, price_output, price_tier, speed_rating, context_window, license_type, default_for_agent, sort_order, description, pricing_updated_at",
      )
      .order("sort_order", { ascending: true });
    if (!include_disabled) query = query.eq("is_enabled", true);
    const { data, error } = await query;
    if (error) return fail(error.message);
    return ok({ count: data?.length ?? 0, models: data ?? [] });
  },
});
