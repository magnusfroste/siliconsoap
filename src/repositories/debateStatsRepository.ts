import { supabase } from '@/integrations/supabase/client';
import type { ProfileStats } from '@/services/profileStatsService';
import { deriveProfileStats } from '@/services/debateStatsService';
export interface FeaturedDebate {
  id: string;
  title: string;
  prompt: string;
  share_id: string;
  real_view_count: number;
  created_at: string;
  message_count: number;
  agent_count: number;
}


export async function fetchFeaturedDebates(): Promise<FeaturedDebate[]> {
        const { data: chats, error } = await supabase
          .from('agent_chats')
          .select('id, title, prompt, share_id, real_view_count, created_at')
          .eq('is_public', true)
          .not('share_id', 'is', null)
          .is('deleted_at', null)
          .order('real_view_count', { ascending: false }).order('created_at', { ascending: false })
          .limit(3);

        if (error) throw error;

        if (chats && chats.length > 0) {
          const debatesWithCounts = await Promise.all(
            chats.map(async (chat) => {
              const { count: messageCount } = await supabase
                .from('agent_chat_messages')
                .select('*', { count: 'exact', head: true })
                .eq('chat_id', chat.id);

              const { data: agents } = await supabase
                .from('agent_chat_messages')
                .select('agent')
                .eq('chat_id', chat.id);

              const uniqueAgents = new Set(agents?.map(a => a.agent) || []);

              return {
                ...chat,
                message_count: messageCount || 0,
                agent_count: uniqueAgents.size,
              };
            })
          );

          return debatesWithCounts.filter(d => d.message_count > 0);
        }
return [];
}
export interface PublicDebate {
  id: string;
  title: string;
  prompt: string;
  share_id: string;
  real_view_count: number;
  created_at: string;
  reaction_count: number;
}


export async function fetchProfileDebates(userId: string): Promise<PublicDebate[]> {
      // Get public chats
      const { data: chats, error } = await supabase
        .from('agent_chats')
        .select('id, title, prompt, share_id, real_view_count, created_at')
        .eq('user_id', userId)
        .eq('is_public', true)
        .not('share_id', 'is', null)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error || !chats) return [];

      // Get reaction counts
      const shareIds = chats.map(c => c.share_id).filter(Boolean) as string[];
      
      if (shareIds.length === 0) {
        return chats.map(c => ({ ...c, reaction_count: 0 }));
      }

      const { data: reactions } = await supabase
        .from('chat_reactions')
        .select('share_id')
        .in('share_id', shareIds);

      // Count reactions per share_id
      const reactionCounts: Record<string, number> = {};
      reactions?.forEach(r => {
        reactionCounts[r.share_id] = (reactionCounts[r.share_id] || 0) + 1;
      });

      return chats.map(c => ({
        ...c,
        share_id: c.share_id ?? '',
        reaction_count: reactionCounts[c.share_id ?? ''] || 0
      }));
}

export async function fetchProfileStats(userId?: string): Promise<ProfileStats> {
if (!userId) return { totalDebates: 0, publicDebates: 0, totalViews: 0, totalReactions: 0, creditsUsed: 0 };
      // Fetch all stats in parallel
      const [chatsResult, creditsResult] = await Promise.all([
        supabase
          .from('agent_chats')
          .select('id, is_public, real_view_count, share_id')
          .eq('user_id', userId)
          .is('deleted_at', null),
        supabase
          .from('user_credits')
          .select('credits_used')
          .eq('user_id', userId)
          .single()
      ]);

      const chats = chatsResult.data || [];
      const publicChats = chats.filter(c => c.is_public && c.share_id);
      const creditsUsed = creditsResult.data?.credits_used || 0;

      // Get reactions for public chats
      let totalReactions = 0;
      if (publicChats.length > 0) {
        const shareIds = publicChats.map(c => c.share_id).filter(Boolean) as string[];
        if (shareIds.length > 0) {
          const { count } = await supabase
            .from('chat_reactions')
            .select('*', { count: 'exact', head: true })
            .in('share_id', shareIds);
          totalReactions = count || 0;
        }
      }

      return deriveProfileStats(chats, totalReactions, creditsUsed);
}

export async function fetchLiveDebateRows() {
 const rows = [];
 for (let offset = 0; ; offset += 1000) {
 const { data, error } = await supabase.from('agent_chats').select('id,real_view_count,settings').is('deleted_at', null).order('id').range(offset, offset + 999);
 if (error) throw error;
 rows.push(...(data ?? []));
 if ((data ?? []).length < 1000) return rows;
 }
}
