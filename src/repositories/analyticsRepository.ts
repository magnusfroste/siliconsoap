import { supabase } from '@/integrations/supabase/client';

export interface ChatSettings {
  participationMode?: 'spectator' | 'jump-in';
  turnOrder?: 'alternating' | 'random' | 'free-for-all';
  conversationTone?: 'formal' | 'casual' | 'heated' | 'collaborative';
  responseLength?: 'concise' | 'balanced' | 'detailed';
  agreementBias?: number;
  temperature?: number;
  personalityIntensity?: 'mild' | 'moderate' | 'extreme';
}

export interface ChatAnalytics {
  id: string;
  chat_id: string | null;
  user_id: string | null;
  total_messages: number;
  total_tokens_used: number;
  estimated_cost: number;
  generation_duration_ms: number;
  is_guest: boolean;
  user_agent: string | null;
  prompt_preview: string | null;
  scenario_id: string | null;
  models_used: string[] | null;
  num_agents: number;
  num_rounds: number;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  session_id: string | null;
  ip_address: string | null;
  country_code: string | null;
  // Joined from agent_chats
  is_public: boolean | null;
  share_id: string | null;
  settings: ChatSettings | null;
}

export interface AnalyticsSummary {
  totalChats: number;
  chatsToday: number;
  chatsThisWeek: number;
  uniqueUsers: number;
  guestPercentage: number;
}

export interface ModelUsageStats {
  model_id: string;
  call_count: number;
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  estimated_cost: number;
}

export const analyticsRepository = {
  async getAll(limit = 100): Promise<ChatAnalytics[]> {
    // Fetch analytics with joined chat data for settings and sharing info
    const { data, error } = await supabase
      .from('chat_analytics')
      .select(`
        *,
        agent_chats!chat_analytics_chat_id_fkey (
          is_public,
          share_id,
          settings
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }

    // Transform data to flatten the joined fields
    return (data || []).map((row: any) => ({
      ...row,
      is_public: row.agent_chats?.is_public ?? null,
      share_id: row.agent_chats?.share_id ?? null,
      settings: row.agent_chats?.settings ?? null,
      agent_chats: undefined // Remove the nested object
    }));
  },

  async getSummary(): Promise<AnalyticsSummary> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Get all analytics for calculations
    const { data: allData, error } = await supabase
      .from('chat_analytics')
      .select('id, user_id, is_guest, created_at');

    if (error) {
      console.error('Error fetching analytics summary:', error);
      throw error;
    }

    const all = allData || [];
    const totalChats = all.length;
    const chatsToday = all.filter(c => c.created_at >= todayStart).length;
    const chatsThisWeek = all.filter(c => c.created_at >= weekStart).length;
    
    const uniqueUserIds = new Set(all.filter(c => c.user_id).map(c => c.user_id));
    const uniqueUsers = uniqueUserIds.size;
    
    const guestChats = all.filter(c => c.is_guest).length;
    const guestPercentage = totalChats > 0 ? Math.round((guestChats / totalChats) * 100) : 0;

    return {
      totalChats,
      chatsToday,
      chatsThisWeek,
      uniqueUsers,
      guestPercentage
    };
  },

  async logChatStart(params: {
    chatId?: string;
    userId?: string;
    isGuest: boolean;
    promptPreview: string;
    scenarioId: string;
    modelsUsed: string[];
    numAgents: number;
    numRounds: number;
    sessionId?: string;
  }): Promise<string | null> {
    // Only use chat_id if it's a valid UUID (not guest session IDs like "guest_123")
    const isValidUuid = params.chatId && !params.chatId.startsWith('guest_');
    const sessionId = params.sessionId || params.chatId || null;
    
    const { data, error } = await supabase
      .from('chat_analytics')
      .insert({
        chat_id: isValidUuid ? params.chatId : null,
        user_id: params.userId || null,
        is_guest: params.isGuest,
        prompt_preview: params.promptPreview.slice(0, 200),
        scenario_id: params.scenarioId,
        models_used: params.modelsUsed,
        num_agents: params.numAgents,
        num_rounds: params.numRounds,
        user_agent: navigator.userAgent,
        started_at: new Date().toISOString(),
        session_id: sessionId
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error logging chat start:', error);
      return null;
    }

    const analyticsId = data?.id || null;

    // Fire and forget: capture IP address via edge function
    if (analyticsId || sessionId) {
      supabase.functions.invoke('log-battle-start', {
        body: { analyticsId, sessionId }
      }).catch(err => {
        console.warn('Failed to log IP (non-critical):', err);
      });
    }

    return analyticsId;
  },

  async logChatComplete(analyticsId: string, totalMessages: number, durationMs: number): Promise<void> {
    const { error } = await supabase
      .from('chat_analytics')
      .update({
        total_messages: totalMessages,
        generation_duration_ms: durationMs,
        completed_at: new Date().toISOString()
      })
      .eq('id', analyticsId);

    if (error) {
      console.error('Error logging chat complete:', error);
    }
  },

  async logChatCompleteByChartId(chatId: string, totalMessages: number, durationMs: number): Promise<void> {
    // For guest chats, use session_id instead of chat_id (which is UUID only)
    const isGuestChat = chatId.startsWith('guest_');
    
    const query = supabase
      .from('chat_analytics')
      .update({
        total_messages: totalMessages,
        generation_duration_ms: durationMs,
        completed_at: new Date().toISOString()
      })
      .is('completed_at', null);

    // Use appropriate column based on chat type
    const { error } = isGuestChat 
      ? await query.eq('session_id', chatId)
      : await query.eq('chat_id', chatId);

    if (error) {
      console.error('Error logging chat complete by chat_id:', error);
    }
  },

  async getModelUsageStats(): Promise<ModelUsageStats[]> {
    const { data, error } = await supabase
      .from('user_token_usage')
      .select('model_id, prompt_tokens, completion_tokens, total_tokens, estimated_cost');

    if (error) {
      console.error('Error fetching model usage stats:', error);
      return [];
    }

    // Aggregate by model_id
    const statsMap = new Map<string, ModelUsageStats>();
    
    for (const row of data || []) {
      const existing = statsMap.get(row.model_id);
      if (existing) {
        existing.call_count += 1;
        existing.total_tokens += row.total_tokens;
        existing.prompt_tokens += row.prompt_tokens;
        existing.completion_tokens += row.completion_tokens;
        existing.estimated_cost += Number(row.estimated_cost);
      } else {
        statsMap.set(row.model_id, {
          model_id: row.model_id,
          call_count: 1,
          total_tokens: row.total_tokens,
          prompt_tokens: row.prompt_tokens,
          completion_tokens: row.completion_tokens,
          estimated_cost: Number(row.estimated_cost)
        });
      }
    }

    // Sort by total tokens descending
    return Array.from(statsMap.values()).sort((a, b) => b.total_tokens - a.total_tokens);
  },

  async getTokenUsagePerChat(chatIds: string[]): Promise<Record<string, number>> {
    if (chatIds.length === 0) return {};
    
    const { data, error } = await supabase
      .from('user_token_usage')
      .select('chat_id, total_tokens')
      .in('chat_id', chatIds);

    if (error) {
      console.error('Error fetching token usage per chat:', error);
      return {};
    }

    // Aggregate tokens per chat_id
    const tokensMap: Record<string, number> = {};
    for (const row of data || []) {
      if (row.chat_id) {
        tokensMap[row.chat_id] = (tokensMap[row.chat_id] || 0) + row.total_tokens;
      }
    }

    return tokensMap;
  }
};
