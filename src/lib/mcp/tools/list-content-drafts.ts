import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, isAdmin, ok, supabaseAnon, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_content_drafts",
  title: "List content drafts",
  description:
    "List editorial content written for SiliconSoap. Admins see every draft; everyone else sees only published pieces. Use `include_body` to read the full markdown.",
  inputSchema: {
    status: z.enum(["draft", "review", "published"]).optional(),
    kind: z.string().optional().describe("Filter on content type, e.g. 'blog_post'."),
    include_body: z.boolean().optional().describe("Include the full markdown body."),
    limit: z.number().int().optional().describe("1-50, default 20."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, kind, include_body, limit }, ctx) => {
    const authed = ctx.isAuthenticated();
    const admin = authed ? await isAdmin(ctx) : false;
    const supabase = authed ? supabaseForUser(ctx) : supabaseAnon();
    const columns = [
      "id, kind, title, summary, tags, source_chat_ids, status, author_label, created_at, updated_at",
      include_body ? ", body" : "",
    ].join("");

    let query = supabase
      .from("content_drafts")
      .select(columns)
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(limit ?? 20, 1), 50));
    if (status) query = query.eq("status", status);
    else if (!admin) query = query.eq("status", "published");
    if (kind) query = query.eq("kind", kind);

    const { data, error } = await query;
    if (error) return fail(error.message);
    return ok({
      scope: admin ? "all_drafts" : "published_only",
      count: data?.length ?? 0,
      drafts: data ?? [],
    });
  },
});
