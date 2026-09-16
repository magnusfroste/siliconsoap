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
  user_email?: string | null;
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
    // Fetch analytics first
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('chat_analytics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (analyticsError) {
      console.error('Error fetching analytics:', analyticsError);
      throw analyticsError;
    }

    if (!analyticsData || analyticsData.length === 0) {
      return [];
    }

    // Get chat_ids to fetch agent_chats data
    const chatIds = analyticsData
      .filter(a => a.chat_id)
      .map(a => a.chat_id as string);

    console.log('[getAll] chatIds to fetch:', chatIds.slice(0, 5));

    let chatDataMap: Record<string, { is_public: boolean; share_id: string | null; settings: ChatSettings | null }> = {};

    if (chatIds.length > 0) {
      const { data: chatData, error: chatError } = await supabase
        .from('agent_chats')
        .select('id, is_public, share_id, settings')
        .in('id', chatIds);

      console.log('[getAll] chatData fetched:', chatData?.length, 'error:', chatError);
      console.log('[getAll] sample chatData:', chatData?.slice(0, 2));

      if (!chatError && chatData) {
        chatDataMap = chatData.reduce((acc, chat) => {
          acc[chat.id] = {
            is_public: chat.is_public,
            share_id: chat.share_id,
            settings: chat.settings as ChatSettings | null
          };
          return acc;
        }, {} as Record<string, { is_public: boolean; share_id: string | null; settings: ChatSettings | null }>);
      }
    }

    console.log('[getAll] chatDataMap keys:', Object.keys(chatDataMap).slice(0, 5));

    // Merge analytics with chat data
    return analyticsData.map((row: any) => ({
      ...row,
      is_public: row.chat_id && chatDataMap[row.chat_id] ? chatDataMap[row.chat_id].is_public : null,
      share_id: row.chat_id && chatDataMap[row.chat_id] ? chatDataMap[row.chat_id].share_id : null,
      settings: row.chat_id && chatDataMap[row.chat_id] ? chatDataMap[row.chat_id].settings : null
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

  // Writes go through the log-battle-start edge function (service role);
  // clients have no INSERT/UPDATE access to chat_analytics.
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
    try {
      const { data, error } = await supabase.functions.invoke('log-battle-start', {
        body: {
          chatId: params.chatId,
          sessionId: params.sessionId || params.chatId,
          promptPreview: params.promptPreview,
          scenarioId: params.scenarioId,
          modelsUsed: params.modelsUsed,
          numAgents: params.numAgents,
          numRounds: params.numRounds
        }
      });

      if (error) {
        console.warn('Failed to log chat start (non-critical):', error);
        return null;
      }

      return (data as { analyticsId?: string } | null)?.analyticsId ?? null;
    } catch (err) {
      console.warn('Failed to log chat start (non-critical):', err);
      return null;
    }
  },

  async logChatComplete(
    analyticsId: string,
    totalMessages: number,
    durationMs: number,
    sessionId?: string
  ): Promise<void> {
    try {
      await supabase.functions.invoke('log-battle-start', {
        body: { action: 'complete', analyticsId, sessionId, totalMessages, durationMs }
      });
    } catch (err) {
      console.warn('Failed to log chat complete (non-critical):', err);
    }
  },

  async logChatCompleteByChartId(chatId: string, totalMessages: number, durationMs: number): Promise<void> {
    // Guest chats are matched by session_id, logged-in chats by chat_id (ownership checked server-side)
    const isGuestChat = chatId.startsWith('guest_');
    try {
      await supabase.functions.invoke('log-battle-start', {
        body: {
          action: 'complete',
          sessionId: isGuestChat ? chatId : undefined,
          chatId: isGuestChat ? undefined : chatId,
          totalMessages,
          durationMs
        }
      });
    } catch (err) {
      console.warn('Failed to log chat complete (non-critical):', err);
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
  },

  async getUserEmails(userIds: string[]): Promise<Record<string, string>> {
    if (userIds.length === 0) return {};
    
    const emailMap: Record<string, string> = {};
    
    // Fetch emails in batches to avoid hitting limits
    for (const userId of userIds) {
      const { data, error } = await supabase
        .rpc('get_user_email', { p_user_id: userId });
      
      if (!error && data) {
        emailMap[userId] = data;
      }
    }
    
    return emailMap;
  },

  async getUserDisplayNames(userIds: string[]): Promise<Record<string, string>> {
    if (userIds.length === 0) return {};
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('user_id, display_name')
      .in('user_id', userIds);
    
    if (error) {
      console.error('Error fetching user display names:', error);
      return {};
    }
    
    const nameMap: Record<string, string> = {};
    for (const profile of data || []) {
      if (profile.display_name) {
        nameMap[profile.user_id] = profile.display_name;
      }
    }
    
    return nameMap;
  }
};
