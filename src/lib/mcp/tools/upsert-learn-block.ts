import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { audited, fail, isAdmin, ok, requireAuth, supabaseForUser } from "../supabase";

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,60}$/;

export default defineTool({
  name: "upsert_learn_block",
  title: "Write a Learn section block",
  description:
    "Admin only. Create, update, publish or delete a content block rendered in the /learn crash course or on the /about page (use tab 'about'). Blocks are keyed by `slug`, so writing the same slug twice updates it rather than duplicating. `kind` controls rendering: 'callout' = highlighted box, 'note'/'section' = titled prose, 'term' = glossary entry (use the term as `title`), 'link' = titled prose with `meta.url` as a button. Status starts as 'draft' and is only visible on the site once set to 'published'. Read `list_learn_blocks` first, keep prose short and factual, and never invent benchmark numbers.",
  inputSchema: {
    action: z.enum(["upsert", "publish", "unpublish", "delete"]).describe("Defaults to 'upsert'."),
    slug: z.string().describe("Stable identifier, lowercase kebab-case, e.g. 'why-open-weights-2026'."),
    tab: z
      .enum(["models", "privacy", "local", "agents", "glossary", "about"])
      .optional()
      .describe("Required when creating a new block."),
    kind: z.enum(["note", "callout", "term", "section", "link"]).optional(),
    title: z.string().optional(),
    body: z.string().optional().describe("Plain text / light markdown. Blank lines separate paragraphs, lines starting with '- ' render as bullets."),
    meta: z
      .record(z.any())
      .optional()
      .describe("Optional extras: { url, url_label, example, source } — `example` is shown for glossary terms."),
    position: z.number().int().optional().describe("Sort order within the tab, lower first."),
    status: z.enum(["draft", "review", "published"]).optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  handler: async (input, ctx) => {
    requireAuth(ctx);
    if (!(await isAdmin(ctx))) return fail("Admin role required.");

    const slug = input.slug?.trim().toLowerCase();
    if (!slug || !SLUG_RE.test(slug)) {
      return fail("`slug` must be lowercase kebab-case, 2-61 chars, e.g. 'agentic-ops-2026'.");
    }

    const supabase = supabaseForUser(ctx);
    const action = input.action ?? "upsert";

    return audited(
      ctx,
      {
        tool_name: "upsert_learn_block",
        action,
        target_type: "learn_block",
        target_id: slug,
        input,
      },
      async () => {
        const { data: existing, error: readError } = await supabase
          .from("learn_blocks")
          .select("id, tab, slug, kind, title, status, position")
          .eq("slug", slug)
          .maybeSingle();
        if (readError) return fail(readError.message);

        if (action === "delete") {
          if (!existing) return fail(`No learn block with slug '${slug}'.`);
          const { error } = await supabase.from("learn_blocks").delete().eq("slug", slug);
          if (error) return fail(error.message);
          return ok({ action: "deleted", slug });
        }

        if (action === "publish" || action === "unpublish") {
          if (!existing) return fail(`No learn block with slug '${slug}'.`);
          const status = action === "publish" ? "published" : "draft";
          const { data, error } = await supabase
            .from("learn_blocks")
            .update({ status, updated_by: ctx.getUserId(), updated_by_label: ctx.getUserEmail?.() ?? null })
            .eq("slug", slug)
            .select()
            .maybeSingle();
          if (error) return fail(error.message);
          return ok({ action, block: data });
        }

        const patch: Record<string, unknown> = {
          updated_by: ctx.getUserId(),
          updated_by_label: ctx.getUserEmail?.() ?? null,
        };
        for (const key of ["tab", "kind", "title", "body", "meta", "position", "status"] as const) {
          const value = input[key];
          if (value !== undefined) patch[key] = value;
        }

        if (!existing) {
          if (!input.tab) return fail("`tab` is required when creating a new block.");
          if (!input.title?.trim() || !input.body?.trim()) {
            return fail("`title` and `body` are required when creating a new block.");
          }
          const { data, error } = await supabase
            .from("learn_blocks")
            .insert({ slug, kind: input.kind ?? "note", status: input.status ?? "draft", ...patch })
            .select()
            .maybeSingle();
          if (error) return fail(error.message);
          return ok({ action: "created", block: data }, `Created learn block '${slug}' (status: ${data?.status}).`);
        }

        const { data, error } = await supabase
          .from("learn_blocks")
          .update(patch)
          .eq("slug", slug)
          .select()
          .maybeSingle();
        if (error) return fail(error.message);
        return ok({ action: "updated", previous: existing, block: data });
      },
    );
  },
});
