import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { shouldAutoSaveGuest, useGuestDebateSave } from '../useGuestDebateSave';

const { invoke } = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { functions: { invoke } } }));

describe('shouldAutoSaveGuest', () => {
  it('saves once when ready', () => expect(shouldAutoSaveGuest(true, null, 'c1')).toBe(true));
  it('never auto-retries the same debate', () => expect(shouldAutoSaveGuest(true, 'c1', 'c1')).toBe(false));
  it('waits until ready', () => expect(shouldAutoSaveGuest(false, null, 'c1')).toBe(false));
  it('allows a new debate', () => expect(shouldAutoSaveGuest(true, 'c1', 'c2')).toBe(true));
  it('never auto-saves a persisted debate after remount', () => expect(shouldAutoSaveGuest(true, null, 'guest_123', 'share123')).toBe(false));
});

describe('guest save persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    invoke.mockReset();
    invoke.mockResolvedValue({ data: { shareId: 'share123' }, error: null });
  });
  afterEach(() => vi.restoreAllMocks());
  const buildBody = () => ({ prompt: 'Hi', sessionId: 'guest_123' });

  it('starts saved on mount and does not call the server', () => {
    localStorage.setItem('guest_saved_share:guest_123', 'share123');
    const { result } = renderHook(() => useGuestDebateSave(true, 'guest_123', buildBody));
    expect(result.current.status).toBe('saved');
    expect(result.current.shareId).toBe('share123');
    expect(invoke).not.toHaveBeenCalled();
  });

  it('sends clientKey, persists success and skips saving after a reload', async () => {
    const first = renderHook(() => useGuestDebateSave(true, 'guest_123', buildBody));
    await waitFor(() => expect(first.result.current.status).toBe('saved'));
    expect(invoke).toHaveBeenCalledWith('save-guest-debate', { body: { prompt: 'Hi', sessionId: 'guest_123', clientKey: 'guest_123' } });
    expect(localStorage.getItem('guest_saved_share:guest_123')).toBe('share123');
    first.unmount();
    const second = renderHook(() => useGuestDebateSave(true, 'guest_123', buildBody));
    expect(second.result.current.shareId).toBe('share123');
    expect(invoke).toHaveBeenCalledTimes(1);
  });

  it('falls back to mount-only protection when storage is unavailable', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    const { result, rerender } = renderHook(() => useGuestDebateSave(true, 'guest_123', buildBody));
    await waitFor(() => expect(result.current.status).toBe('saved'));
    rerender();
    expect(result.current.shareId).toBe('share123');
    expect(invoke).toHaveBeenCalledTimes(1);
  });

  it('keeps failed saves manual-only and persists a successful retry', async () => {
    invoke.mockResolvedValueOnce({ data: null, error: new Error('offline') });
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result, rerender } = renderHook(() => useGuestDebateSave(true, 'guest_123', buildBody));
    await waitFor(() => expect(result.current.status).toBe('failed'));
    rerender();
    expect(invoke).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('guest_saved_share:guest_123')).toBeNull();
    await act(async () => result.current.retry());
    await waitFor(() => expect(result.current.status).toBe('saved'));
    expect(localStorage.getItem('guest_saved_share:guest_123')).toBe('share123');
  });

  it('uses the new debate key when the route changes without remounting', async () => {
    const { result, rerender } = renderHook(({ key }) => useGuestDebateSave(true, key, buildBody), { initialProps: { key: 'guest_123' } });
    await waitFor(() => expect(result.current.status).toBe('saved'));
    rerender({ key: 'guest_456' });
    await waitFor(() => expect(localStorage.getItem('guest_saved_share:guest_456')).toBe('share123'));
    expect(invoke).toHaveBeenLastCalledWith('save-guest-debate', { body: { prompt: 'Hi', sessionId: 'guest_123', clientKey: 'guest_456' } });
  });
});
