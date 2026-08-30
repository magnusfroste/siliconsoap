import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, supabaseAnon, supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_debate",
  title: "Get debate transcript",
  description:
    "Fetch a debate and its full transcript by debate id or public share id. Signed-in callers can also read their own private debates.",
  inputSchema: {
    id: z.string().optional().describe("Debate UUID."),
    share_id: z.string().optional().describe("Public share id, as in /shared/<share_id>."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id, share_id }, ctx) => {
    if (!id && !share_id) return fail("Provide either `id` or `share_id`.");
    const supabase = ctx.isAuthenticated() ? supabaseForUser(ctx) : supabaseAnon();

    let query = supabase.from("agent_chats").select("*").is("deleted_at", null);
    query = id ? query.eq("id", id) : query.eq("share_id", share_id!);
    const { data: debate, error } = await query.maybeSingle();
    if (error) return fail(error.message);
    if (!debate) return fail("Debate not found (or not public).");

    const { data: messages, error: msgErr } = await supabase
      .from("agent_chat_messages")
      .select("agent, persona, message, model, created_at")
      .eq("chat_id", debate.id)
      .order("created_at", { ascending: true });
    if (msgErr) return fail(msgErr.message);

    return ok({
      debate,
      messages: messages ?? [],
      status: debate.run_status ?? "completed",
      share_url: debate.share_id
        ? `https://siliconsoap.com/shared/${debate.share_id}`
        : null,
    });
  },
});
