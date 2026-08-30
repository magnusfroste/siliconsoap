import { defineTool } from "@lovable.dev/mcp-js";
import { fail, ok, supabaseAnon } from "../supabase";

export default defineTool({
  name: "list_feature_flags",
  title: "List feature flags",
  description:
    "List every SiliconSoap feature flag and configuration value (enabled state, text value, numeric value). This is the platform's configuration source of truth.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const { data, error } = await supabaseAnon()
      .from("feature_flags")
      .select("key, name, description, enabled, text_value, numeric_value, updated_at")
      .order("key", { ascending: true });
    if (error) return fail(error.message);
    return ok({ count: data?.length ?? 0, flags: data ?? [] });
  },
});
