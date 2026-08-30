import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, isAdmin, ok, supabaseAnon, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_learn_blocks",
  title: "List Learn section blocks",
  description:
    "Read the agent-maintained content blocks shown in the /learn crash course and on the /about page. Admins see drafts too; everyone else sees only published blocks. Always call this before writing so you can reuse an existing `slug` instead of creating a duplicate.",
  inputSchema: {
    tab: z
      .enum(["models", "privacy", "local", "agents", "glossary", "about"])
      .optional()
      .describe("Which section to read (Learn tabs, or "about" for the /about page)."),
    status: z.enum(["draft", "review", "published"]).optional(),
    limit: z.number().int().optional().describe("1-100, default 50."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ tab, status, limit }, ctx) => {
    const authed = ctx.isAuthenticated();
    const admin = authed ? await isAdmin(ctx) : false;
    const supabase = authed ? supabaseForUser(ctx) : supabaseAnon();

    let query = supabase
      .from("learn_blocks")
      .select(
        "id, tab, slug, kind, title, body, meta, position, status, updated_by_label, created_at, updated_at",
      )
      .order("tab", { ascending: true })
      .order("position", { ascending: true })
      .limit(Math.min(Math.max(limit ?? 50, 1), 100));

    if (tab) query = query.eq("tab", tab);
    if (status) query = query.eq("status", status);
    else if (!admin) query = query.eq("status", "published");

    const { data, error } = await query;
    if (error) return fail(error.message);

    return ok({
      scope: admin ? "all_blocks" : "published_only",
      tabs: ["models", "privacy", "local", "agents", "glossary", "about"],
      count: data?.length ?? 0,
      blocks: data ?? [],
    });
  },
});
