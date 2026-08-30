import { defineTool } from "@lovable.dev/mcp-js";
import { fail, invokeFunction, isAdmin, ok, requireAuth } from "../supabase";

export default defineTool({
  name: "sync_model_pricing",
  title: "Sync model pricing & capabilities",
  description:
    "Admin only. Refresh pricing, context windows and reasoning support for every curated model from the live OpenRouter catalog.",
  inputSchema: {},
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
  handler: async (_input, ctx) => {
    requireAuth(ctx);
    if (!(await isAdmin(ctx))) return fail("Admin role required.");
    const { status, body } = await invokeFunction(ctx, "sync-model-pricing", {
      method: "POST",
      body: {},
    });
    if (status >= 400) {
      const message =
        (body as { error?: string })?.error ?? `Pricing sync failed (${status}).`;
      return fail(message);
    }
    return ok(
      typeof body === "object" && body !== null
        ? (body as Record<string, unknown>)
        : { result: body },
    );
  },
});
