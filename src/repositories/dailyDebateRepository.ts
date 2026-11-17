import { supabase } from '@/integrations/supabase/client';
import { DAILY_DEBATE_MAX_AGE_MS, type DailyDebateRow } from '@/services/dailyDebateService';

export async function fetchDailyDebates(now: number): Promise<DailyDebateRow[]> {
  const { data, error } = await supabase.from('agent_chats')
    .select('title,prompt,share_id,created_at,is_public,deleted_at,settings')
    .eq('is_public', true).is('deleted_at', null).not('share_id', 'is', null)
    .eq('settings->>series', 'daily')
    .gte('created_at', new Date(now - DAILY_DEBATE_MAX_AGE_MS).toISOString())
    .lte('created_at', new Date(now).toISOString())
    .order('created_at', { ascending: false }).limit(1);
  if (error) throw error;
  return data ?? [];
}