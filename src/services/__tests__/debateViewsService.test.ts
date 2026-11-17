import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { recordDebateView } from '@/repositories/debateViewsRepository';
import { recordSharedDebateView, shouldRecordDebateView } from '../debateViewsService';

vi.mock('@/repositories/debateViewsRepository', () => ({ recordDebateView: vi.fn() }));
const human = { hostname: 'siliconsoap.com', userAgent: 'Mozilla/5.0', webdriver: false };

describe('real debate view eligibility', () => {
  it('counts humans only on the production apex host', () => {
    expect(shouldRecordDebateView(human)).toBe(true);
  });
  it.each(['localhost', 'siliconsoap.lovable.app', 'id-preview--test.lovable.app', 'www.siliconsoap.com', 'share.siliconsoap.com', 'siliconsoap.com.attacker.test'])('skips %s', (hostname) => {
    expect(shouldRecordDebateView({ ...human, hostname })).toBe(false);
  });
  it('skips webdriver', () => {
    expect(shouldRecordDebateView({ ...human, webdriver: true })).toBe(false);
  });
  it.each(['Googlebot', 'Crawler', 'Spider', 'Slack-link-preview', 'HeadlessChrome', 'Lighthouse'])('skips %s agents', (userAgent) => {
    expect(shouldRecordDebateView({ ...human, userAgent })).toBe(false);
  });
});

describe('best-effort view recording', () => {
  afterEach(() => vi.unstubAllGlobals());
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('window', { location: { hostname: 'siliconsoap.com' }, localStorage: { getItem: vi.fn(() => null), setItem: vi.fn() } });
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0', webdriver: false });
  });
  it('persists a random visitor key before recording', async () => {
    await recordSharedDebateView('abc123');
    const key = vi.mocked(recordDebateView).mock.calls[0]?.[1];
    expect(key).toMatch(/^[A-Za-z0-9_-]{8,64}$/);
    expect(window.localStorage.setItem).toHaveBeenCalledWith('ss_visitor_id', key);
  });
  it('reuses the stored visitor identifier', async () => {
    vi.mocked(window.localStorage.getItem).mockReturnValue('visitor_123');
    await recordSharedDebateView('abc123');
    expect(recordDebateView).toHaveBeenCalledWith('abc123', 'visitor_123');
    expect(window.localStorage.setItem).not.toHaveBeenCalled();
  });
  it('skips recording if storage reads fail', async () => {
    vi.mocked(window.localStorage.getItem).mockImplementation(() => { throw new Error('blocked'); });
    await recordSharedDebateView('abc123');
    expect(recordDebateView).not.toHaveBeenCalled();
  });
  it('skips recording if storage writes fail', async () => {
    vi.mocked(window.localStorage.setItem).mockImplementation(() => { throw new Error('blocked'); });
    await recordSharedDebateView('abc123');
    expect(recordDebateView).not.toHaveBeenCalled();
  });
  it('swallows network errors', async () => {
    vi.mocked(recordDebateView).mockRejectedValueOnce(new Error('offline'));
    await expect(recordSharedDebateView('abc123')).resolves.toBeUndefined();
  });
});