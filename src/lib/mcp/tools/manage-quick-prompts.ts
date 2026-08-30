import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, isAdmin, ok, requireAuth, supabaseForUser } from "../supabase";

export default defineTool({
  name: "manage_quick_prompts",
  title: "Manage quick prompts",
  description:
    "Admin only. Keep SiliconSoap's suggested debate topics fresh: add new prompts, enable/disable or delete existing ones, and reshuffle their display order.",
  inputSchema: {
    action: z
      .enum(["add", "set_enabled", "delete", "shuffle"])
      .describe("What to do. 'shuffle' randomizes sort_order for all prompts."),
    topic: z.string().optional().describe("For 'add': the prompt text."),
    scenario_id: z
      .string()
      .optional()
      .describe("For 'add': scenario id. Defaults to 'general-problem'."),
    id: z.string().optional().describe("Prompt id for 'set_enabled' and 'delete'."),
    is_enabled: z.boolean().optional().describe("For 'set_enabled'."),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  handler: async ({ action, topic, scenario_id, id, is_enabled }, ctx) => {
    requireAuth(ctx);
    if (!(await isAdmin(ctx))) return fail("Admin role required.");
    const supabase = supabaseForUser(ctx);

    if (action === "add") {
      if (!topic?.trim()) return fail("`topic` is required for action 'add'.");
      const { data, error } = await supabase
        .from("quick_prompts")
        .insert({
          topic: topic.trim(),
          scenario_id: scenario_id ?? "general-problem",
          is_enabled: true,
          sort_order: Math.floor(Math.random() * 1000),
        })
        .select()
        .maybeSingle();
      if (error) return fail(error.message);
      return ok({ action: "added", prompt: data });
    }

    if (action === "set_enabled") {
      if (!id) return fail("`id` is required.");
      if (is_enabled === undefined) return fail("`is_enabled` is required.");
      const { data, error } = await supabase
        .from("quick_prompts")
        .update({ is_enabled })
        .eq("id", id)
        .select()
        .maybeSingle();
      if (error) return fail(error.message);
      if (!data) return fail("Prompt not found.");
      return ok({ action: "updated", prompt: data });
    }

    if (action === "delete") {
      if (!id) return fail("`id` is required.");
      const { error } = await supabase.from("quick_prompts").delete().eq("id", id);
      if (error) return fail(error.message);
      return ok({ action: "deleted", id });
    }

    // shuffle
    const { data: prompts, error: readErr } = await supabase
      .from("quick_prompts")
      .select("id");
    if (readErr) return fail(readErr.message);
    const ids = (prompts ?? []).map((p) => p.id);
    const order = ids.map((_, i) => i).sort(() => Math.random() - 0.5);
    let updated = 0;
    for (let i = 0; i < ids.length; i++) {
      const { error } = await supabase
        .from("quick_prompts")
        .update({ sort_order: order[i] })
        .eq("id", ids[i]);
      if (!error) updated++;
    }
    return ok({ action: "shuffled", updated });
  },
});
