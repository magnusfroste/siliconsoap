import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, requireAuth, supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_debate_status",
  title: "Get debate run status",
  description:
    "Poll the run status of one of your debates: queued | running | completed | failed, with round progress and message count.",
  inputSchema: { id: z.string().describe("Debate UUID returned by `create_debate`.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }, ctx) => {
    requireAuth(ctx);
    const supabase = supabaseForUser(ctx);
    const { data: chat, error } = await supabase
      .from("agent_chats")
      .select(
        "id, title, run_status, run_error, run_current_round, run_total_rounds, run_started_at, run_completed_at, share_id",
      )
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) return fail(error.message);
    if (!chat) return fail("Debate not found.");

    const { count } = await supabase
      .from("agent_chat_messages")
      .select("id", { count: "exact", head: true })
      .eq("chat_id", id);

    return ok({
      id: chat.id,
      title: chat.title,
      status: chat.run_status ?? "completed",
      error: chat.run_error,
      current_round: chat.run_current_round,
      total_rounds: chat.run_total_rounds,
      messages_so_far: count ?? 0,
      share_url: chat.share_id
        ? `https://siliconsoap.com/shared/${chat.share_id}`
        : null,
    });
  },
});
