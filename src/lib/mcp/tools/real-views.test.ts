import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ToolContext } from '@lovable.dev/mcp-js';
import { isAdmin } from '../supabase';
import listTool from './list-debates';
import getTool from './get-debate';
import statsTool from './site-stats';

const fixture = vi.hoisted(() => ({
  selects: [] as string[],
  debate: { id: 'debate1', title: 'News', share_id: 'share1', real_view_count: 7, view_count: 42, settings: {}, run_status: 'completed' },
}));
vi.mock('../supabase', () => {
  const client = () => ({ from: () => {
    const query = {
      select: (fields: string) => { fixture.selects.push(fields); return query; },
      eq: () => query, is: () => query, or: () => query, order: () => query,
      limit: () => query, range: () => query,
      maybeSingle: async () => ({ data: fixture.debate, error: null }),
      then: (resolve: (result: unknown) => void) => resolve({ data: [fixture.debate], error: null, count: 1 }),
    };
    return query;
  }});
  return { supabaseAnon: vi.fn(client), supabaseForUser: vi.fn(client), isAdmin: vi.fn(async () => false), ok: (value: unknown) => value, fail: (error: string) => ({ error }) };
});
const ctx = (signedIn: boolean) => ({ isAuthenticated: () => signedIn }) as ToolContext;

describe('MCP real view reporting', () => {
  beforeEach(() => { fixture.selects.length = 0; vi.mocked(isAdmin).mockResolvedValue(false); });
  it('adds real_view_count to list_debates only for validated admins', async () => {
    await listTool.handler({ search: undefined, order: undefined, limit: undefined }, ctx(true));
    expect(fixture.selects[0]).not.toContain('real_view_count');
    vi.mocked(isAdmin).mockResolvedValue(true);
    await listTool.handler({ search: undefined, order: undefined, limit: undefined }, ctx(true));
    expect(fixture.selects[1]).toContain('real_view_count');
  });
  it('omits real_view_count from non-admin get_debate output', async () => {
    const result = await getTool.handler({ id: 'debate1', share_id: undefined }, ctx(true));
    expect(result).toHaveProperty('debate.view_count', 42);
    expect(result).not.toHaveProperty('debate.real_view_count');
  });
  it('includes real_view_count for admin get_debate', async () => {
    vi.mocked(isAdmin).mockResolvedValue(true);
    expect(await getTool.handler({ id: 'debate1', share_id: undefined }, ctx(true))).toHaveProperty('debate.real_view_count', 7);
  });
  it('keeps public site_stats unchanged', async () => {
    const result = await statsTool.handler({}, ctx(false));
    expect(result).toHaveProperty('total_views', 42);
    expect(result).not.toHaveProperty('total_real_views');
  });
  it('reports separate real totals and rankings to admins', async () => {
    vi.mocked(isAdmin).mockResolvedValue(true);
    const result = await statsTool.handler({}, ctx(true));
    expect(result).toHaveProperty('total_views', 42);
    expect(result).toHaveProperty('total_real_views', 7);
    expect(result).toHaveProperty('top_debates_by_real_views', [{ title: 'News', real_view_count: 7, url: 'https://siliconsoap.com/shared/share1' }]);
  });
});