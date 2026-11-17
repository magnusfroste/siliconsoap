export function totalRealViews(rows: { real_view_count?: number | null }[]): number {
 return rows.reduce((sum, row) => sum + (row.real_view_count ?? 0), 0);
}
export function deriveLiveStats(rows: { real_view_count?: number | null; settings: unknown }[]) {
 return { totalDebates: rows.length, totalViews: totalRealViews(rows), totalAgents: rows.reduce((sum, row) => sum + ((row.settings as { agentCount?: number } | null)?.agentCount || 2), 0) };
}

export function deriveProfileStats(rows: { is_public: boolean | null; share_id: string | null; real_view_count?: number | null }[], totalReactions: number, creditsUsed: number) {
  const publicChats = rows.filter(row => row.is_public && row.share_id);
  return { totalDebates: rows.length, publicDebates: publicChats.length, totalViews: totalRealViews(publicChats), totalReactions, creditsUsed };
}
