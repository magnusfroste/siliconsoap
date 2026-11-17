import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ToolContext } from '@lovable.dev/mcp-js';
import { invokeFunction } from '../supabase';
import tool from './seed-featured-debate';

vi.mock('../supabase', () => ({
  requireAuth: vi.fn(), isAdmin: vi.fn(async () => true),
  audited: vi.fn(async (_ctx, _entry, operation) => operation()),
  invokeFunction: vi.fn(async () => ({ status: 200, body: { shareId: 'daily123' } })),
  ok: vi.fn((value) => value), fail: vi.fn((error) => ({ error })),
}));
const ctx = {} as ToolContext;
const input = {
  topic: 'News question?', models: ['lab/a', 'lab/b'],
  prompt: undefined, agent_names: undefined, personas: undefined, scenario_id: undefined,
  target_date: undefined, featured: undefined, series: undefined,
  view_count_min: undefined, view_count_max: undefined, reaction_count: undefined,
};

describe('editorial debate MCP inputs', () => {
  beforeEach(() => vi.clearAllMocks());
  it('defaults to featured with zero fabricated views and reactions', async () => {
    await tool.handler(input, ctx);
    expect(invokeFunction).toHaveBeenCalledWith(ctx, 'seed-debates', expect.objectContaining({
      body: expect.objectContaining({ featured: true, viewCountMin: 0, viewCountMax: 0, reactionCount: 0 }),
    }));
  });
  it('passes featured false and the daily series without replacing the showdown', async () => {
    await tool.handler({ ...input, featured: false, series: 'daily' }, ctx);
    expect(invokeFunction).toHaveBeenCalledWith(ctx, 'seed-debates', expect.objectContaining({
      body: expect.objectContaining({ featured: false, series: 'daily' }),
    }));
  });
  it('limits the series to 32 characters', () => {
    expect(tool.inputSchema.series.safeParse('x'.repeat(32)).success).toBe(true);
    expect(tool.inputSchema.series.safeParse('x'.repeat(33)).success).toBe(false);
  });
});