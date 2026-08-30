import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, requireAuth, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_my_debates",
  title: "List my debates",
  description: "List the signed-in user's own debates, newest first.",
  inputSchema: { limit: z.number().int().optional().describe("1-50, default 20.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    const userId = requireAuth(ctx);
    const { data, error } = await supabaseForUser(ctx)
      .from("agent_chats")
      .select(
        "id, title, prompt, scenario_id, share_id, is_public, view_count, run_status, created_at",
      )
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(limit ?? 20, 1), 50));
    if (error) return fail(error.message);
    return ok({ count: data?.length ?? 0, debates: data ?? [] });
  },
});
