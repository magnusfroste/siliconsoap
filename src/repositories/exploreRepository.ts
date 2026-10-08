import { supabase } from '@/integrations/supabase/client';
import { PAGE_SIZE, sanitizeQuestionSearch, type ExploreDebate, type ExploreFilters } from '@/services/exploreService';
const selection = 'id,title,prompt,share_id,created_at,settings,featured_at,agent_chat_messages(count),transcript:agent_chat_messages(agent,model,persona,created_at)';
export async function fetchExplorePage(filters: ExploreFilters, offset: number, modelIds: string[] | null, signal: AbortSignal) {
  if (modelIds && !modelIds.length) return { debates: [], hasMore: false };
  let query = supabase.from('agent_chats').select(selection).eq('is_public', true).not('share_id', 'is', null).is('deleted_at', null);
  if (filters.tab === 'showdowns') query = query.not('featured_at', 'is', null).order('featured_at', { ascending: false });
  else query = query.order('created_at', { ascending: false });
  const search = sanitizeQuestionSearch(filters.q);
  if (search) query = query.or(`title.ilike.%${search}%,prompt.ilike.%${search}%`);
  if (modelIds) {
    const ids = modelIds.map(id => `"${id.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`).join(',');
    query = query.or(['agentA','agentB','agentC'].map(key => `settings->models->>${key}.in.(${ids})`).join(','));
  }
  const { data, error } = await query.order('id').range(offset, offset + PAGE_SIZE - 1).abortSignal(signal);
  if (error) throw error;
  return { debates: (data || []) as unknown as ExploreDebate[], hasMore: data?.length === PAGE_SIZE };
}
export async function fetchShowdowns(signal: AbortSignal) {
  const { data, error } = await supabase.from('agent_chats')
    .select('id,title,prompt,share_id,created_at,settings,featured_at,agent_chat_messages(count),transcript:agent_chat_messages(agent,model,persona,message,created_at)')
    .eq('is_public', true).not('share_id', 'is', null).is('deleted_at', null).not('featured_at','is',null)
    .order('featured_at', { ascending: false }).abortSignal(signal);
  if (error) throw error;
  return (data || []) as unknown as ExploreDebate[];
}
