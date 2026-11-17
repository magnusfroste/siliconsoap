import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchFeaturedDebates, fetchProfileStats, fetchLiveDebateRows } from '@/repositories/debateStatsRepository';
import { chatRepository } from '@/repositories/chatRepository';

const state = vi.hoisted(() => ({
  selects: [] as string[], orders: [] as string[], ranges: [] as number[],
  rows: [{ id: 'chat1', real_view_count: 7, view_count: 500, is_public: true, share_id: 'share1', settings: {} }],
}));
vi.mock('@/integrations/supabase/client', () => ({ supabase: {
  rpc: () => ({ maybeSingle: async () => ({ data: { id: 'chat1', view_count: 500, settings: {} }, error: null }) }),
  from: (table: string) => {
    let offset = 0;
    const query = {
      select: (fields: string) => { state.selects.push(fields); return query; },
      eq: () => query, is: () => query, not: () => query, in: () => query,
      order: (field: string) => { state.orders.push(field); return query; }, limit: () => query,
      range: (from: number) => { offset = from; state.ranges.push(from); return query; },
      single: async () => ({ data: { credits_used: 2 }, error: null }),
      maybeSingle: async () => ({ data: { real_view_count: 7 }, error: null }),
      then: (resolve: (v: unknown) => void) => resolve({ data: table === 'agent_chats' ? state.rows.slice(offset, offset + 1000) : [], count: 1, error: null }),
    };
    return query;
  },
} }));

describe('real view repository reads', () => {
  beforeEach(() => { state.selects = []; state.orders = []; state.ranges = []; state.rows = [{ id: 'chat1', real_view_count: 7, view_count: 500, is_public: true, share_id: 'share1', settings: {} }]; });
  it('sorts featured debates by real views, then newest', async () => {
    await fetchFeaturedDebates();
    expect(state.orders).toEqual(['real_view_count', 'created_at']);
  });
  it('uses real views in public profile totals', async () => {
    expect(await fetchProfileStats('owner')).toHaveProperty('totalViews', 7);
  });
  it('reads all landing statistics pages beyond 1000 debates', async () => {
    state.rows = Array.from({ length: 1001 }, (_, i) => ({ id: `chat${i}`, real_view_count: 1, view_count: 500, is_public: true, share_id: `share${i}`, settings: {} }));
    expect(await fetchLiveDebateRows()).toHaveLength(1001);
    expect(state.ranges).toEqual([0, 1000]);
  });
  it('loads shared real counts independently of the legacy-only shared RPC', async () => {
    const chat = await chatRepository.getChatByShareId('share1');
    expect(chat?.real_view_count).toBe(7);
    expect(chat?.view_count).toBe(500);
  });
});