import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, isAdmin, ok, requireAuth, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_agent_activity",
  title: "List agent activity log",
  description:
    "Read the append-only audit log of every maintenance action agents performed over MCP (tool, target, input, result, success, duration). Admins see all activity; other callers see only their own. Use this for follow-up, verification and weekly reports.",
  inputSchema: {
    tool_name: z.string().optional().describe("Filter on a single tool, e.g. 'set_feature_flag'."),
    only_failures: z.boolean().optional().describe("Only return actions that failed."),
    since: z.string().optional().describe("ISO timestamp — only entries created after this."),
    limit: z.number().int().optional().describe("1-100, default 30."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ tool_name, only_failures, since, limit }, ctx) => {
    requireAuth(ctx);
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("agent_activity_log")
      .select(
        "id, created_at, actor_label, client_id, source, tool_name, action, target_type, target_id, success, error_message, input, result, duration_ms",
      )
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(limit ?? 30, 1), 100));
    if (tool_name) query = query.eq("tool_name", tool_name);
    if (only_failures) query = query.eq("success", false);
    if (since) query = query.gte("created_at", since);

    const { data, error } = await query;
    if (error) return fail(error.message);

    const entries = data ?? [];
    const failures = entries.filter((e) => e.success === false).length;
    return ok({
      scope: (await isAdmin(ctx)) ? "all_agents" : "own_actions",
      count: entries.length,
      failures,
      entries,
    });
  },
});
