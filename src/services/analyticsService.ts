import { analyticsRepository } from '@/repositories/analyticsRepository';
import type { ChatAnalytics, AnalyticsSummary, ModelUsageStats, ChatSettings } from '@/repositories/analyticsRepository';

export type { ChatAnalytics, AnalyticsSummary, ModelUsageStats, ChatSettings };

export const analyticsService = {
  async getAll(limit = 100): Promise<ChatAnalytics[]> {
    return analyticsRepository.getAll(limit);
  },

  async getSummary(): Promise<AnalyticsSummary> {
    return analyticsRepository.getSummary();
  },

  async getModelUsageStats(): Promise<ModelUsageStats[]> {
    return analyticsRepository.getModelUsageStats();
  },

  async getTokenUsagePerChat(chatIds: string[]): Promise<Record<string, number>> {
    return analyticsRepository.getTokenUsagePerChat(chatIds);
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
    return analyticsRepository.logChatStart(params);
  },

  async logChatComplete(analyticsId: string, totalMessages: number, durationMs: number): Promise<void> {
    return analyticsRepository.logChatComplete(analyticsId, totalMessages, durationMs);
  },

  async logChatCompleteByChartId(chatId: string, totalMessages: number, durationMs: number): Promise<void> {
    return analyticsRepository.logChatCompleteByChartId(chatId, totalMessages, durationMs);
  },

  async getUserEmails(userIds: string[]): Promise<Record<string, string>> {
    return analyticsRepository.getUserEmails(userIds);
  },

  async getUserDisplayNames(userIds: string[]): Promise<Record<string, string>> {
    return analyticsRepository.getUserDisplayNames(userIds);
  }
};
