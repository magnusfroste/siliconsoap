import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { audited, fail, isAdmin, ok, requireAuth, supabaseForUser } from "../supabase";

export default defineTool({
  name: "upsert_agent_profile",
  title: "Add or update an agent persona",
  description:
    "Admin only. Create or update an agent persona used in debates (name, description, system instructions, icon). Read `list_agent_profiles` first so you extend the roster instead of duplicating it.",
  inputSchema: {
    slug: z.string().describe("Stable identifier, e.g. 'contrarian-economist'."),
    name: z.string().optional().describe("Display name. Required for new personas."),
    description: z.string().optional().describe("One line shown in the UI. Required for new personas."),
    instructions: z
      .string()
      .optional()
      .describe("System instructions that shape how this persona argues. Required for new personas."),
    icon_name: z.string().optional().describe("Lucide icon name, e.g. 'Brain'. Defaults to 'Sparkles'."),
    is_premium: z.boolean().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    requireAuth(ctx);
    if (!(await isAdmin(ctx))) return fail("Admin role required.");
    const supabase = supabaseForUser(ctx);

    return audited(
      ctx,
      {
        tool_name: "upsert_agent_profile",
        action: "upsert",
        target_type: "agent_profile",
        target_id: input.slug,
        input,
      },
      async () => {
        const { data: existing, error: readErr } = await supabase
          .from("agent_profiles")
          .select("id, slug, is_system")
          .eq("slug", input.slug)
          .maybeSingle();
        if (readErr) return fail(readErr.message);

        const patch: Record<string, unknown> = {};
        for (const key of ["name", "description", "instructions", "icon_name", "is_premium"] as const) {
          const value = input[key];
          if (value !== undefined) patch[key] = value;
        }

        if (existing) {
          if (Object.keys(patch).length === 0) return fail("Nothing to update.");
          const { data, error } = await supabase
            .from("agent_profiles")
            .update(patch)
            .eq("id", existing.id)
            .select()
            .maybeSingle();
          if (error) return fail(error.message);
          if (!data) return fail("Update blocked — system personas cannot be edited over MCP.");
          return ok({ action: "updated", profile: data });
        }

        if (!input.name || !input.description || !input.instructions) {
          return fail("New personas require `name`, `description` and `instructions`.");
        }
        const { data, error } = await supabase
          .from("agent_profiles")
          .insert({
            slug: input.slug,
            name: input.name,
            description: input.description,
            instructions: input.instructions,
            icon_name: input.icon_name ?? "Sparkles",
            is_premium: input.is_premium ?? false,
            is_system: false,
            user_id: ctx.getUserId(),
          })
          .select()
          .maybeSingle();
        if (error) return fail(error.message);
        return ok({ action: "created", profile: data });
      },
    );
  },
});
