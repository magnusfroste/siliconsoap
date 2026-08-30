import { defineTool } from "@lovable.dev/mcp-js";
import { fail, isAdmin, ok, supabaseForUser } from "../supabase";

export default defineTool({
  name: "whoami",
  title: "Who am I",
  description:
    "Report the signed-in SiliconSoap identity behind this MCP connection: user id, email, display name, admin role and remaining credits.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return ok({ authenticated: false });
    const supabase = supabaseForUser(ctx);
    const userId = ctx.getUserId();

    const [profileRes, creditsRes, admin] = await Promise.all([
      supabase.from("user_profiles").select("display_name").eq("user_id", userId).maybeSingle(),
      supabase
        .from("user_credits")
        .select("credits_remaining, credits_used, tokens_used, token_budget")
        .eq("user_id", userId)
        .maybeSingle(),
      isAdmin(ctx),
    ]);
    if (profileRes.error) return fail(profileRes.error.message);

    return ok({
      authenticated: true,
      user_id: userId,
      email: ctx.getUserEmail(),
      display_name: profileRes.data?.display_name ?? null,
      is_admin: admin,
      credits: creditsRes.data ?? null,
      client_id: ctx.getClientId(),
    });
  },
});
