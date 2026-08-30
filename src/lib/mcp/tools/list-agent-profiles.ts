import { defineTool } from "@lovable.dev/mcp-js";
import { fail, ok, supabaseAnon, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_agent_profiles",
  title: "List agent personas",
  description:
    "List the agent personas available for debates (system personas, plus the caller's own when signed in).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    const supabase = ctx.isAuthenticated() ? supabaseForUser(ctx) : supabaseAnon();
    const { data, error } = await supabase
      .from("agent_profiles")
      .select("slug, name, description, instructions, icon_name, is_system, is_premium")
      .order("name", { ascending: true });
    if (error) return fail(error.message);
    return ok({ count: data?.length ?? 0, profiles: data ?? [] });
  },
});
