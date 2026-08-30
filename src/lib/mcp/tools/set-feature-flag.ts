import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { audited, fail, isAdmin, ok, requireAuth, supabaseForUser } from "../supabase";

export default defineTool({
  name: "set_feature_flag",
  title: "Set a feature flag",
  description:
    "Admin only. Update an existing SiliconSoap feature flag or configuration value (enabled state, text value, numeric value). This changes live platform behaviour immediately.",
  inputSchema: {
    key: z.string().describe("Flag key from `list_feature_flags`, e.g. 'enable_judge_bot'."),
    enabled: z.boolean().optional(),
    text_value: z.string().optional().describe("For config flags such as 'default_judge_model'."),
    numeric_value: z.number().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  handler: async ({ key, enabled, text_value, numeric_value }, ctx) => {
    requireAuth(ctx);
    if (!(await isAdmin(ctx))) return fail("Admin role required.");
    if (enabled === undefined && text_value === undefined && numeric_value === undefined) {
      return fail("Provide at least one of `enabled`, `text_value` or `numeric_value`.");
    }
    return audited(
      ctx,
      {
        tool_name: "set_feature_flag",
        action: "update",
        target_type: "feature_flag",
        target_id: key,
        input: { key, enabled, text_value, numeric_value },
      },
      async () => {
        const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (enabled !== undefined) patch.enabled = enabled;
        if (text_value !== undefined) patch.text_value = text_value;
        if (numeric_value !== undefined) patch.numeric_value = numeric_value;

        const { data, error } = await supabaseForUser(ctx)
          .from("feature_flags")
          .update(patch)
          .eq("key", key)
          .select("key, name, enabled, text_value, numeric_value")
          .maybeSingle();
        if (error) return fail(error.message);
        if (!data) return fail(`No feature flag with key '${key}'.`);
        return ok({ flag: data });
      },
    );
  },
});
