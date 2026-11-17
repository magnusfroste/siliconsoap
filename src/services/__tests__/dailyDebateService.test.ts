import { describe, expect, it } from 'vitest';
import { selectDailyDebate, type DailyDebateRow } from '../dailyDebateService';

const now = Date.parse('2026-11-17T22:20:00Z');
const row = (patch: Partial<DailyDebateRow> = {}): DailyDebateRow => ({
  title: 'Current news question?', prompt: 'Full question?', share_id: 'daily123',
  created_at: '2026-11-17T12:00:00Z', is_public: true, deleted_at: null,
  settings: { series: 'daily', models: { agentA: 'lab/a', agentB: 'lab/b' } }, ...patch,
});
const models = [{ model_id: 'lab/a', display_name: 'Model A' }, { model_id: 'lab/b', display_name: 'Model B' }];

describe('daily debate selection', () => {
  it('selects the newest daily debate and resolves its model names', () => {
    expect(selectDailyDebate([row({ share_id: 'older', created_at: '2026-11-16T12:00:00Z' }), row()], models, now))
      .toEqual({ shareId: 'daily123', title: 'Current news question?', modelNames: ['Model A', 'Model B'] });
  });
  it('accepts the 48-hour boundary but excludes older debates', () => {
    expect(selectDailyDebate([row({ created_at: '2026-11-15T22:20:00Z' })], models, now)?.shareId).toBe('daily123');
    expect(selectDailyDebate([row({ created_at: '2026-11-15T22:19:59Z' })], models, now)).toBeNull();
  });
  it('excludes private debates', () => {
    expect(selectDailyDebate([row({ is_public: false })], models, now)).toBeNull();
  });
  it('excludes deleted and unshared debates', () => {
    expect(selectDailyDebate([row({ deleted_at: '2026-11-17T13:00:00Z' }), row({ share_id: null })], models, now)).toBeNull();
  });
  it('does not select the weekly showdown or other series', () => {
    expect(selectDailyDebate([row({ settings: { series: 'weekly' } }), row({ settings: {} })], models, now)).toBeNull();
  });
  it('renders nothing without a recent daily debate, including future dates', () => {
    expect(selectDailyDebate([], models, now)).toBeNull();
    expect(selectDailyDebate([row({ created_at: '2026-11-18T00:00:00Z' })], models, now)).toBeNull();
  });
});