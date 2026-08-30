import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, supabaseAnon } from "../supabase";

export default defineTool({
  name: "list_hall_of_shame",
  title: "List Hall of Shame moments",
  description:
    "List the most dramatic extracted moments from SiliconSoap debates (quote, agent, shame type, severity).",
  inputSchema: { limit: z.number().int().optional().describe("1-50, default 20.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }) => {
    const { data, error } = await supabaseAnon()
      .from("hall_of_shame")
      .select("agent_name, quote, context, shame_type, severity, share_id, created_at")
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(limit ?? 20, 1), 50));
    if (error) return fail(error.message);
    return ok({ count: data?.length ?? 0, moments: data ?? [] });
  },
});
