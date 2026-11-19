import { describe, it, expect, vi } from 'vitest';
vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));
import { migrationMessageTimestamps } from '../guestMigrationService';

describe('migrationMessageTimestamps', () => {
  it('assigns strictly increasing times 1 ms apart, never in the future', () => {
    const now = 1_700_000_000_000;
    const out = migrationMessageTimestamps([{}, {}, {}], now).map((t) => Date.parse(t));
    expect(out).toEqual([now - 3, now - 2, now - 1]);
  });
  it('keeps existing times only when every message has one', () => {
    const msgs = [{ created_at: '2026-01-01T00:00:00.000Z' }, { created_at: '2026-01-01T00:00:01.000Z' }];
    expect(migrationMessageTimestamps(msgs)).toEqual(msgs.map((m) => m.created_at));
    const out = migrationMessageTimestamps([{ created_at: '2026-01-01T00:00:00.000Z' }, {}], 5000);
    expect(out.map((t) => Date.parse(t))).toEqual([4998, 4999]);
  });
});
