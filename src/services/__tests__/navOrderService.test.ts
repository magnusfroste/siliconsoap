import { describe, expect, it } from 'vitest';
import {
  SIDEBAR_NAV_ITEMS,
  resolveNavOrder,
  serializeNavOrder,
} from '../navOrderService';

// The value currently stored in the `sidebar_nav_order` feature flag.
const LIVE_FLAG = 'explore,models,scoreboard,learn,connect,about,profile,agent-profiles,settings,admin';

describe('navOrderService', () => {
  it('ships the scoreboard and connect destinations instead of leaderboard', () => {
    const keys = SIDEBAR_NAV_ITEMS.map(item => item.key);
    expect(keys).not.toContain('leaderboard');
    expect(keys).toContain('scoreboard');
    expect(keys).toContain('connect');
    expect(SIDEBAR_NAV_ITEMS.find(item => item.key === 'scoreboard')?.label).toBe('Scoreboard');
    expect(SIDEBAR_NAV_ITEMS.find(item => item.key === 'connect')?.label).toBe('Connect your agent');
  });

  it('resolves the live flag to every key in the stored order', () => {
    expect(resolveNavOrder(LIVE_FLAG).map(item => item.key)).toEqual(LIVE_FLAG.split(','));
  });

  it('keeps every key when the resolved live order is saved back', () => {
    expect(serializeNavOrder(resolveNavOrder(LIVE_FLAG))).toBe(LIVE_FLAG);
  });

  it('appends known destinations missing from the saved value', () => {
    const resolved = resolveNavOrder('explore,models,scoreboard');
    expect(resolved.slice(0, 3).map(item => item.key)).toEqual(['explore', 'models', 'scoreboard']);
    expect(resolved.map(item => item.key)).toContain('connect');
  });

  it('preserves an unknown key so saving cannot drop it', () => {
    const resolved = resolveNavOrder('explore,some-new-page,about');
    expect(resolved.map(item => item.key)).toContain('some-new-page');
    expect(serializeNavOrder(resolved)).toContain('some-new-page');
  });

  it('ignores blank and duplicate keys', () => {
    const resolved = resolveNavOrder('explore,, explore ,about');
    expect(resolved.map(item => item.key)).toEqual([
      'explore',
      'about',
      'models',
      'scoreboard',
      'learn',
      'connect',
      'profile',
      'agent-profiles',
      'settings',
      'admin',
    ]);
  });
});
