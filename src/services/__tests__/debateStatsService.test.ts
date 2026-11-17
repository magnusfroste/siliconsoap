import { describe, expect, it } from 'vitest';
import { deriveLiveStats, deriveProfileStats, totalRealViews } from '../debateStatsService';
import { calculateRank } from '../profileStatsService';

describe('real view statistics', () => {
  it('totals real views without falling back to seeded counts', () => {
    const rows = [{ real_view_count: 7, view_count: 900 }, { real_view_count: 0, view_count: 500 }];
    expect(totalRealViews(rows)).toBe(7);
    expect(totalRealViews([{ real_view_count: null }, {}])).toBe(0);
  });
  it('derives landing totals from real views', () => {
    expect(deriveLiveStats([{ real_view_count: 3, settings: { agentCount: 3 } }, { real_view_count: 4, settings: null }]))
      .toEqual({ totalDebates: 2, totalViews: 7, totalAgents: 5 });
  });
  it('includes only shared public debates in profile view totals', () => {
    expect(deriveProfileStats([
      { is_public: true, share_id: 'public', real_view_count: 7 },
      { is_public: false, share_id: 'private', real_view_count: 20 },
      { is_public: true, share_id: null, real_view_count: 30 },
    ], 2, 3)).toEqual({ totalDebates: 3, publicDebates: 1, totalViews: 7, totalReactions: 2, creditsUsed: 3 });
  });
  it('does not award a view-based rank for seeded engagement', () => {
    const rows = [{ real_view_count: 0, view_count: 10000 }];
    const totalViews = totalRealViews(rows);
    expect(calculateRank({ totalDebates: 1, publicDebates: 1, totalViews, totalReactions: 0, creditsUsed: 0 }).level).toBe(2);
  });
  it('awards the view-based rank at 50 real views', () => {
    const base = { totalDebates: 1, publicDebates: 1, totalReactions: 0, creditsUsed: 0 };
    expect(calculateRank({ ...base, totalViews: 49 }).level).toBe(2);
    expect(calculateRank({ ...base, totalViews: 50 }).level).toBe(3);
  });
});