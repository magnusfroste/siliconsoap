import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSharedChat } from '../useSharedChat';

const { rpc, getSharedChat, recordSharedDebateView } = vi.hoisted(() => ({
  rpc: vi.fn(), getSharedChat: vi.fn(), recordSharedDebateView: vi.fn(),
}));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { rpc } }));
vi.mock('@/services', () => ({ chatService: { getSharedChat } }));
vi.mock('@/services/debateViewsService', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/services/debateViewsService')>(),
  recordSharedDebateView,
}));

describe('shared debate view counters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rpc.mockResolvedValue({ error: null });
    getSharedChat.mockResolvedValue({ chat: { id: 'chat1', is_public: true, deleted_at: null, settings: {}, view_count: 42, real_view_count: 7 }, messages: [] });
  });

  it('increments displayed views once per shareId per mount alongside real views', async () => {
    const first = renderHook(({ shareId }) => useSharedChat(shareId), { initialProps: { shareId: 'share1' } });
    await waitFor(() => expect(first.result.current.loading).toBe(false));
    expect(first.result.current.chat?.real_view_count).toBe(7);
    expect(rpc).toHaveBeenCalledWith('increment_chat_view_count', { p_share_id: 'share1' });
    expect(recordSharedDebateView).toHaveBeenCalledWith('share1');
    first.rerender({ shareId: 'share1' });
    expect(rpc).toHaveBeenCalledTimes(1);
    first.rerender({ shareId: 'share2' });
    await waitFor(() => expect(recordSharedDebateView).toHaveBeenCalledWith('share2'));
    expect(rpc).toHaveBeenLastCalledWith('increment_chat_view_count', { p_share_id: 'share2' });
    first.rerender({ shareId: 'share1' });
    await waitFor(() => expect(first.result.current.loading).toBe(false));
    expect(rpc).toHaveBeenCalledTimes(2);
    first.unmount();
    const second = renderHook(() => useSharedChat('share1'));
    await waitFor(() => expect(second.result.current.loading).toBe(false));
    expect(rpc).toHaveBeenCalledTimes(3);
    expect(recordSharedDebateView).toHaveBeenCalledTimes(3);
  });

  it('fires the displayed increment before loading completes, even for unavailable chats', async () => {
    getSharedChat.mockResolvedValue({ chat: null, messages: [] });
    const { result } = renderHook(() => useSharedChat('missing'));
    expect(rpc).toHaveBeenCalledWith('increment_chat_view_count', { p_share_id: 'missing' });
    await waitFor(() => expect(result.current.error).toBe('not_found'));
    expect(recordSharedDebateView).not.toHaveBeenCalled();
  });

  it('does not wait for or propagate displayed increment failures', async () => {
    rpc.mockRejectedValueOnce(new Error('offline'));
    const { result } = renderHook(() => useSharedChat('share1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(recordSharedDebateView).toHaveBeenCalledWith('share1');
  });

  it('does not count without a shareId', () => {
    renderHook(() => useSharedChat(undefined));
    expect(rpc).not.toHaveBeenCalled();
    expect(recordSharedDebateView).not.toHaveBeenCalled();
  });
});