import { defineTool } from "@lovable.dev/mcp-js";
import { fail, ok, supabaseAnon, supabaseForUser, isAdmin } from "../supabase";

export default defineTool({
  name: "site_stats",
  title: "Site statistics",
  description:
    "Live SiliconSoap platform stats: public debate count, seeded views, model counts and most viewed debates. Admins also receive total real views and the top five by real views.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_args, ctx) => {
    const admin = ctx.isAuthenticated() && await isAdmin(ctx);
    const supabase = admin ? supabaseForUser(ctx) : supabaseAnon();

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

    let realViewStats = {};
    if (admin) {
      let totalRealViews = 0;
      // Read every page rather than silently truncating totals at the API row limit.
      for (let offset = 0; ; offset += 1000) {
        const { data, error } = await supabase.from("agent_chats")
          .select("real_view_count").eq("is_public", true).is("deleted_at", null)
          .order("id").range(offset, offset + 999);
        if (error) return fail(error.message);
        totalRealViews += (data ?? []).reduce((sum, row) => sum + (row.real_view_count ?? 0), 0);
        if ((data ?? []).length < 1000) break;
      }
      const { data, error } = await supabase.from("agent_chats")
        .select("title, share_id, real_view_count").eq("is_public", true).is("deleted_at", null)
        .order("real_view_count", { ascending: false }).order("id").limit(5);
      if (error) return fail(error.message);
      realViewStats = {
        total_real_views: totalRealViews,
        top_debates_by_real_views: (data ?? []).map((debate) => ({
          title: debate.title,
          real_view_count: debate.real_view_count,
          url: debate.share_id ? `https://siliconsoap.com/shared/${debate.share_id}` : null,
        })),
      };
    }

    return ok({
      ...realViewStats,
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
