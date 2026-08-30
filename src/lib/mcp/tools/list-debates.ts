import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, supabaseAnon } from "../supabase";

export default defineTool({
  name: "list_debates",
  title: "List public debates",
  description:
    "List public SiliconSoap debates (newest or most viewed first), optionally filtered by a text search on the topic.",
  inputSchema: {
    search: z.string().optional().describe("Free-text filter on debate title/prompt."),
    order: z
      .enum(["newest", "most_viewed"])
      .optional()
      .describe("Sort order. Defaults to newest."),
    limit: z.number().int().optional().describe("1-50, default 20."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, order, limit }) => {
    const supabase = supabaseAnon();
    const take = Math.min(Math.max(limit ?? 20, 1), 50);
    let query = supabase
      .from("agent_chats")
      .select(
        "id, title, prompt, scenario_id, settings, share_id, view_count, created_at, run_status",
      )
      .eq("is_public", true)
      .is("deleted_at", null);
    if (search?.trim()) {
      const term = search.trim().replace(/[%,]/g, " ");
      query = query.or(`title.ilike.%${term}%,prompt.ilike.%${term}%`);
    }
    query =
      order === "most_viewed"
        ? query.order("view_count", { ascending: false })
        : query.order("created_at", { ascending: false });
    const { data, error } = await query.limit(take);
    if (error) return fail(error.message);
    return ok({ count: data?.length ?? 0, debates: data ?? [] });
  },
});
