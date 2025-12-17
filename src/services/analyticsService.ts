import { analyticsRepository } from '@/repositories/analyticsRepository';
import type { ChatAnalytics, AnalyticsSummary } from '@/repositories/analyticsRepository';

export type { ChatAnalytics, AnalyticsSummary };

export const analyticsService = {
  async getAll(limit = 100): Promise<ChatAnalytics[]> {
    return analyticsRepository.getAll(limit);
  },

  async getSummary(): Promise<AnalyticsSummary> {
    return analyticsRepository.getSummary();
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
    return analyticsRepository.logChatStart(params);
  },

  async logChatComplete(analyticsId: string, totalMessages: number, durationMs: number): Promise<void> {
    return analyticsRepository.logChatComplete(analyticsId, totalMessages, durationMs);
  },

  async logChatCompleteByChartId(chatId: string, totalMessages: number, durationMs: number): Promise<void> {
    return analyticsRepository.logChatCompleteByChartId(chatId, totalMessages, durationMs);
  }
};
