export const DAILY_DEBATE_MAX_AGE_MS = 48 * 60 * 60 * 1000;

export interface DailyDebateRow {
  title: string;
  prompt: string;
  share_id: string | null;
  created_at: string | null;
  is_public: boolean | null;
  deleted_at: string | null;
  settings: unknown;
}

export interface DailyDebate {
  shareId: string;
  title: string;
  modelNames: string[];
}

function dailySettings(settings: unknown): { series?: unknown; models?: unknown } {
  return typeof settings === 'object' && settings !== null ? settings : {};
}

/** Only a recent, public, non-deleted daily debate may appear on the landing page. */
export function selectDailyDebate(
  rows: DailyDebateRow[],
  models: { model_id: string; display_name: string }[],
  now: number,
): DailyDebate | null {
  const row = rows.filter((candidate) => {
    const createdAt = Date.parse(candidate.created_at ?? '');
    return candidate.is_public === true && candidate.deleted_at === null && !!candidate.share_id
      && dailySettings(candidate.settings).series === 'daily'
      && createdAt >= now - DAILY_DEBATE_MAX_AGE_MS && createdAt <= now;
  }).sort((a, b) => Date.parse(b.created_at ?? '') - Date.parse(a.created_at ?? ''))[0];
  if (!row?.share_id) return null;
  const cast = dailySettings(row.settings).models;
  const modelIds = typeof cast === 'object' && cast !== null
    ? Object.values(cast).filter((id): id is string => typeof id === 'string' && !!id)
    : [];
  const names = new Map(models.map((model) => [model.model_id, model.display_name]));
  return {
    shareId: row.share_id,
    title: row.title || row.prompt,
    modelNames: [...new Set(modelIds)].map((id) => names.get(id) ?? id),
  };
}