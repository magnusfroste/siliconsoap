import { defineTool } from "@lovable.dev/mcp-js";
import { fail, ok, supabaseAnon, supabaseForUser, isAdmin } from "../supabase";

export default defineTool({
  name: "site_stats",
  title: "Site statistics",
  description:
    "Live SiliconSoap platform stats: public debate count, real daily-unique views, model counts and most viewed debates. Admins also receive total real views and the top five by real views.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_args, ctx) => {
    const admin = ctx.isAuthenticated() && await isAdmin(ctx);
    const supabase = admin ? supabaseForUser(ctx) : supabaseAnon();

    const [{ count: debateCount, error: countErr }, modelsRes, topRes] =
      await Promise.all([
        supabase
          .from("agent_chats")
          .select("id", { count: "exact", head: true })
          .eq("is_public", true)
          .is("deleted_at", null),
        supabase.from("curated_models").select("model_id, is_enabled, supports_reasoning"),
        supabase
          .from("agent_chats")
          .select("title, share_id, real_view_count")
          .eq("is_public", true)
          .is("deleted_at", null)
          .order("real_view_count", { ascending: false }).order("created_at", { ascending: false })
          .limit(5),
      ]);

    if (countErr) return fail(countErr.message);
    if (topRes.error) return fail(topRes.error.message);
    const rows: { real_view_count: number; settings: unknown }[] = [];
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await supabase.from("agent_chats")
        .select("real_view_count, settings").eq("is_public", true).is("deleted_at", null)
        .order("id").range(offset, offset + 999);
      if (error) return fail(error.message);
      rows.push(...(data ?? []));
      if ((data ?? []).length < 1000) break;
    }
    const totalViews = rows.reduce((sum, row) => sum + (row.real_view_count ?? 0), 0);
    const totalAgents = rows.reduce((sum, r) => {
      const settings = (r.settings ?? {}) as Record<string, unknown>;
      const n = Number(settings.agentCount ?? 2);
      return sum + (Number.isFinite(n) ? n : 2);
    }, 0);
    const models = modelsRes.data ?? [];

    let realViewStats = {};
    if (admin) {
      realViewStats = {
        total_real_views: totalViews,
        top_debates_by_real_views: (topRes.data ?? []).map((debate) => ({
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
        views: d.real_view_count,
        url: d.share_id ? `https://siliconsoap.com/shared/${d.share_id}` : null,
      })),
    });
  },
});
