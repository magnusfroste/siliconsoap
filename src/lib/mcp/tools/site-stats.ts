import { defineTool } from "@lovable.dev/mcp-js";
import { fail, ok, supabaseAnon } from "../supabase";

export default defineTool({
  name: "site_stats",
  title: "Site statistics",
  description:
    "Live SiliconSoap platform stats: public debate count, total views, model counts and the most viewed debates.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const supabase = supabaseAnon();

    const [{ count: debateCount, error: countErr }, viewsRes, modelsRes, topRes] =
      await Promise.all([
        supabase
          .from("agent_chats")
          .select("id", { count: "exact", head: true })
          .eq("is_public", true)
          .is("deleted_at", null),
        supabase
          .from("agent_chats")
          .select("view_count, settings")
          .eq("is_public", true)
          .is("deleted_at", null),
        supabase.from("curated_models").select("model_id, is_enabled, supports_reasoning"),
        supabase
          .from("agent_chats")
          .select("title, share_id, view_count")
          .eq("is_public", true)
          .is("deleted_at", null)
          .order("view_count", { ascending: false })
          .limit(5),
      ]);

    if (countErr) return fail(countErr.message);
    if (viewsRes.error) return fail(viewsRes.error.message);

    const rows = viewsRes.data ?? [];
    const totalViews = rows.reduce((sum, r) => sum + (r.view_count ?? 0), 0);
    const totalAgents = rows.reduce((sum, r) => {
      const settings = (r.settings ?? {}) as Record<string, unknown>;
      const n = Number(settings.agentCount ?? 2);
      return sum + (Number.isFinite(n) ? n : 2);
    }, 0);
    const models = modelsRes.data ?? [];

    return ok({
      public_debates: debateCount ?? 0,
      total_views: totalViews,
      agents_unleashed: totalAgents,
      models_total: models.length,
      models_enabled: models.filter((m) => m.is_enabled).length,
      models_with_reasoning: models.filter((m) => m.supports_reasoning).length,
      top_debates: (topRes.data ?? []).map((d) => ({
        title: d.title,
        views: d.view_count,
        url: d.share_id ? `https://siliconsoap.com/shared/${d.share_id}` : null,
      })),
    });
  },
});
