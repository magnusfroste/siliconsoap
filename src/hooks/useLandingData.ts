import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LandingModel {
  model_id: string;
  display_name: string;
  provider: string;
  origin_region: string | null;
  license_type: string | null;
  speed_rating: string | null;
  category: string | null;
  price_tier: string | null;
  created_at: string;
}

export interface ShowdownColumn {
  agentKey: string;
  displayName: string;
  modelId: string;
  license: string | null;
  origin: string | null;
  isNew: boolean;
  quote: string;
}

export interface Showdown {
  shareId: string;
  prompt: string;
  columns: ShowdownColumn[];
}

export interface ArchiveDebate {
  shareId: string;
  prompt: string;
  modelIds: string[];
}

/** Fixed archive debates with curated, balanced headlines. */
export const ARCHIVE_DEBATES: { shareId: string; headline: string }[] = [
  {
    shareId: '49pierlo',
    headline:
      'Should Swedish companies ban American AI providers after the US government shut down Fable 5?',
  },
  {
    shareId: 'pd2leq5r',
    headline: 'Will Flash models make large reasoning models economically obsolete?',
  },
  {
    shareId: 'w41zkk3r',
    headline:
      'Are AI agents going to change business processes in 2026 — and how much productivity will they gain?',
  },
];

export const ARCHIVE_SHARE_IDS = ARCHIVE_DEBATES.map((d) => d.shareId);

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function originLabel(region: string | null | undefined): string | null {
  switch (region) {
    case 'US':
      return 'United States';
    case 'CN':
      return 'China';
    case 'EU':
      return 'European Union';
    case 'OTHER':
      return 'Other';
    default:
      return null;
  }
}

/** Origin wording for use inside a sentence, e.g. "8 from the United States". */
export function originSentenceLabel(region: string | null | undefined): string | null {
  switch (region) {
    case 'US':
      return 'the United States';
    case 'CN':
      return 'China';
    case 'EU':
      return 'the European Union';
    case 'OTHER':
      return 'other regions';
    default:
      return null;
  }
}

export function isOpenWeights(license: string | null | undefined): boolean {
  return !!license && license.toLowerCase().includes('open');
}

export function speedLabel(speed: string | null | undefined): string | null {
  switch ((speed ?? '').toLowerCase()) {
    case 'fast':
      return 'Fast';
    case 'medium':
      return 'Medium speed';
    case 'slow':
      return 'Slow';
    default:
      return null;
  }
}

export function capitalize(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Strip private reasoning and cut at a sentence boundary. */
export function excerpt(text: string, maxLength = 220): string {
  const clean = text
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
    .replace(/<thinking>[\s\S]*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (clean.length <= maxLength) return clean;
  const slice = clean.slice(0, maxLength);
  const lastStop = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('! '), slice.lastIndexOf('? '));
  if (lastStop > 60) return slice.slice(0, lastStop + 1);
  const lastSpace = slice.lastIndexOf(' ');
  return `${slice.slice(0, lastSpace > 60 ? lastSpace : maxLength).trim()}…`;
}

interface RosterCount {
  label: string;
  count: number;
}

export interface LandingData {
  loading: boolean;
  newModels: LandingModel[];
  totalModels: number;
  openWeightsCount: number;
  originCounts: RosterCount[];
  newestAddedAt: string | null;
  showdown: Showdown | null;
  archive: ArchiveDebate[];
}

export function useLandingData(): LandingData {
  const [data, setData] = useState<LandingData>({
    loading: true,
    newModels: [],
    totalModels: 0,
    openWeightsCount: 0,
    originCounts: [],
    newestAddedAt: null,
    showdown: null,
    archive: [],
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      const [{ data: models }, { data: featured }, { data: archiveRows }] = await Promise.all([
        supabase
          .from('curated_models')
          .select(
            'model_id, display_name, provider, origin_region, license_type, speed_rating, category, price_tier, created_at',
          )
          .eq('is_enabled', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('agent_chats')
          .select('id, share_id, prompt, title, settings, featured_at')
          .not('featured_at', 'is', null)
          .eq('is_public', true)
          .is('deleted_at', null)
          .order('featured_at', { ascending: false })
          .limit(1),
        supabase
          .from('agent_chats')
          .select('share_id, prompt, title, settings')
          .in('share_id', ARCHIVE_SHARE_IDS),
      ]);

      if (!active) return;

      const enabled = (models ?? []) as LandingModel[];
      const byOrigin = new Map<string, number>();
      enabled.forEach((m) => {
        const label = originLabel(m.origin_region);
        if (label) byOrigin.set(label, (byOrigin.get(label) ?? 0) + 1);
      });

      // Showdown
      let showdown: Showdown | null = null;
      const featuredChat = featured?.[0];
      if (featuredChat?.share_id) {
        const settings = (featuredChat.settings ?? {}) as {
          models?: Record<string, string>;
        };
        const modelMap = settings.models ?? {};
        const agentKeys = ['agentA', 'agentB', 'agentC'].filter((k) => modelMap[k]);

        const { data: messages } = await supabase
          .from('agent_chat_messages')
          .select('agent, message, model, created_at')
          .eq('chat_id', featuredChat.id)
          .order('created_at', { ascending: true });

        const modelIds = agentKeys.map((k) => modelMap[k]);
        const { data: modelRows } = await supabase
          .from('curated_models')
          .select('model_id, display_name, license_type, origin_region, created_at')
          .in('model_id', modelIds);

        const modelInfo = new Map((modelRows ?? []).map((m) => [m.model_id, m]));
        const featuredAt = featuredChat.featured_at ? new Date(featuredChat.featured_at).getTime() : Date.now();

        const columns: ShowdownColumn[] = agentKeys.map((key, index) => {
          const modelId = modelMap[key];
          const info = modelInfo.get(modelId);
          const firstMessage =
            (messages ?? []).find((m) => m.model === modelId) ??
            (messages ?? [])[index];
          const createdAt = info?.created_at ? new Date(info.created_at).getTime() : 0;
          return {
            agentKey: key,
            displayName: info?.display_name ?? modelId,
            modelId,
            license: info?.license_type ?? null,
            origin: originLabel(info?.origin_region),
            isNew: createdAt > 0 && featuredAt - createdAt <= WEEK_MS && createdAt <= featuredAt,
            quote: firstMessage?.message ? excerpt(firstMessage.message) : '',
          };
        });

        showdown = {
          shareId: featuredChat.share_id,
          prompt: featuredChat.prompt || featuredChat.title || '',
          columns,
        };
      }

      const archive: ArchiveDebate[] = ARCHIVE_SHARE_IDS.map((shareId) => {
        const row = (archiveRows ?? []).find((r) => r.share_id === shareId);
        if (!row) return null;
        const settings = (row.settings ?? {}) as { models?: Record<string, string> };
        const modelIds = Object.values(settings.models ?? {}).filter(Boolean) as string[];
        return {
          shareId,
          prompt: row.prompt || row.title || '',
          modelIds,
        };
      }).filter(Boolean) as ArchiveDebate[];

      setData({
        loading: false,
        newModels: enabled.slice(0, 4),
        totalModels: enabled.length,
        openWeightsCount: enabled.filter((m) => isOpenWeights(m.license_type)).length,
        originCounts: [...byOrigin.entries()]
          .map(([label, count]) => ({ label, count }))
          .sort((a, b) => b.count - a.count),
        newestAddedAt: enabled[0]?.created_at ?? null,
        showdown,
        archive,
      });
    };

    load().catch(() => {
      if (active) setData((prev) => ({ ...prev, loading: false }));
    });

    return () => {
      active = false;
    };
  }, []);

  return data;
}
