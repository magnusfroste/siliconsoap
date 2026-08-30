import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type LearnBlockKind = 'note' | 'callout' | 'term' | 'section' | 'link';
export type LearnTab = 'models' | 'privacy' | 'local' | 'agents' | 'glossary' | 'about';

export interface LearnBlock {
  id: string;
  tab: LearnTab;
  slug: string;
  kind: LearnBlockKind;
  title: string;
  body: string;
  meta: Record<string, unknown> | null;
  position: number;
  updated_at: string;
  updated_by_label: string | null;
}

/**
 * Published Learn blocks for one tab. These are written by maintenance agents
 * over MCP (`upsert_learn_block`) and rendered above the static crash course.
 */
export const useLearnBlocks = (tab: LearnTab) => {
  const [blocks, setBlocks] = useState<LearnBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    (async () => {
      const { data, error } = await supabase
        .from('learn_blocks')
        .select('id, tab, slug, kind, title, body, meta, position, updated_at, updated_by_label')
        .eq('tab', tab)
        .eq('status', 'published')
        .order('position', { ascending: true })
        .order('updated_at', { ascending: false });

      if (!active) return;
      if (error) {
        setBlocks([]);
      } else {
        setBlocks((data ?? []) as unknown as LearnBlock[]);
      }
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [tab]);

  return { blocks, loading };
};
