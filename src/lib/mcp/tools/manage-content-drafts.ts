import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { audited, fail, isAdmin, ok, requireAuth, supabaseForUser } from "../supabase";

export default defineTool({
  name: "manage_content_drafts",
  title: "Write and manage content drafts",
  description:
    "Admin only. Save editorial content an agent has written about SiliconSoap — blog posts, weekly recaps, social snippets, SEO copy — as a draft, then update its status ('draft' | 'review' | 'published') or delete it. Use `list_debates` / `get_debate` / `site_stats` as source material and cite the debates in `source_chat_ids`.",
  inputSchema: {
    action: z.enum(["create", "update", "delete"]),
    id: z.string().optional().describe("Draft id for 'update' and 'delete'."),
    title: z.string().optional(),
    body: z.string().optional().describe("Markdown body of the draft."),
    summary: z.string().optional().describe("One or two sentence teaser."),
    kind: z
      .enum(["blog_post", "weekly_recap", "social_snippet", "seo_copy", "note"])
      .optional()
      .describe("Content type. Defaults to 'blog_post'."),
    tags: z.array(z.string()).optional(),
    source_chat_ids: z.array(z.string()).optional().describe("Debate UUIDs used as source material."),
    status: z.enum(["draft", "review", "published"]).optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  handler: async (input, ctx) => {
    requireAuth(ctx);
    if (!(await isAdmin(ctx))) return fail("Admin role required.");
    const supabase = supabaseForUser(ctx);
    const { action, id } = input;

    return audited(
      ctx,
      {
        tool_name: "manage_content_drafts",
        action,
        target_type: "content_draft",
        target_id: id ?? input.title ?? null,
        input,
      },
      async () => {
        if (action === "create") {
          if (!input.title?.trim() || !input.body?.trim()) {
            return fail("`title` and `body` are required when creating a draft.");
          }
          const { data, error } = await supabase
            .from("content_drafts")
            .insert({
              author_user_id: ctx.getUserId(),
              author_label: ctx.getUserEmail?.() ?? null,
              kind: input.kind ?? "blog_post",
              title: input.title.trim(),
              summary: input.summary ?? null,
              body: input.body,
              tags: input.tags ?? [],
              source_chat_ids: input.source_chat_ids ?? [],
              status: input.status ?? "draft",
            })
            .select()
            .maybeSingle();
          if (error) return fail(error.message);
          return ok({ action: "created", draft: data });
        }

        if (!id) return fail("`id` is required for this action.");

        if (action === "delete") {
          const { error } = await supabase.from("content_drafts").delete().eq("id", id);
          if (error) return fail(error.message);
          return ok({ action: "deleted", id });
        }

        const patch: Record<string, unknown> = {};
        for (const key of ["title", "body", "summary", "kind", "tags", "status"] as const) {
          const value = input[key];
          if (value !== undefined) patch[key] = value;
        }
        if (input.source_chat_ids !== undefined) patch.source_chat_ids = input.source_chat_ids;
        if (Object.keys(patch).length === 0) return fail("Nothing to update.");

        const { data, error } = await supabase
          .from("content_drafts")
          .update(patch)
          .eq("id", id)
          .select()
          .maybeSingle();
        if (error) return fail(error.message);
        if (!data) return fail("Draft not found.");
        return ok({ action: "updated", draft: data });
      },
    );
  },
});
