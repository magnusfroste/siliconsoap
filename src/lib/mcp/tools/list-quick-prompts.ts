import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, supabaseAnon, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_quick_prompts",
  title: "List quick prompts",
  description:
    "List the suggested debate topics shown on the new-debate page. Admin callers also see disabled prompts.",
  inputSchema: {
    scenario_id: z.string().optional().describe("Filter by scenario id."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ scenario_id }, ctx) => {
    const supabase = ctx.isAuthenticated() ? supabaseForUser(ctx) : supabaseAnon();
    let query = supabase
      .from("quick_prompts")
      .select("id, topic, scenario_id, is_enabled, sort_order, updated_at")
      .order("sort_order", { ascending: true });
    if (scenario_id) query = query.eq("scenario_id", scenario_id);
    const { data, error } = await query;
    if (error) return fail(error.message);
    return ok({ count: data?.length ?? 0, prompts: data ?? [] });
  },
});
