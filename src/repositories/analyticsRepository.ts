import { supabase } from '@/integrations/supabase/client';

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
}

export interface AnalyticsSummary {
  totalChats: number;
  chatsToday: number;
  chatsThisWeek: number;
  uniqueUsers: number;
  guestPercentage: number;
}

export const analyticsRepository = {
  async getAll(limit = 100): Promise<ChatAnalytics[]> {
    const { data, error } = await supabase
      .from('chat_analytics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }

    return data || [];
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
  }): Promise<string | null> {
    const { data, error } = await supabase
      .from('chat_analytics')
      .insert({
        chat_id: params.chatId || null,
        user_id: params.userId || null,
        is_guest: params.isGuest,
        prompt_preview: params.promptPreview.slice(0, 200),
        scenario_id: params.scenarioId,
        models_used: params.modelsUsed,
        num_agents: params.numAgents,
        num_rounds: params.numRounds,
        user_agent: navigator.userAgent,
        started_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error logging chat start:', error);
      return null;
    }

    return data?.id || null;
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
    const { error } = await supabase
      .from('chat_analytics')
      .update({
        total_messages: totalMessages,
        generation_duration_ms: durationMs,
        completed_at: new Date().toISOString()
      })
      .eq('chat_id', chatId)
      .is('completed_at', null);

    if (error) {
      console.error('Error logging chat complete by chat_id:', error);
    }
  }
};
