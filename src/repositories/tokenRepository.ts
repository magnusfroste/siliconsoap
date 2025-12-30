// Token Repository - handles all token usage data access
import { supabase } from '@/integrations/supabase/client';
import { TokenUsage, GUEST_TOKENS_KEY, DEFAULT_GUEST_TOKEN_BUDGET, DEFAULT_TOKEN_BUDGET } from '@/models/tokens';

export interface UseTokensResult {
  success: boolean;
  newTokensUsed: number;
  newBudgetRemaining: number;
}

export const tokenRepository = {
  // Get token budget for a user
  async getUserTokenBudget(userId: string): Promise<{ tokenBudget: number; tokensUsed: number } | null> {
    const { data, error } = await supabase
      .from('user_credits')
      .select('token_budget, tokens_used')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error loading token budget:', error);
      return null;
    }

    return data ? {
      tokenBudget: data.token_budget,
      tokensUsed: data.tokens_used
    } : null;
  },

  // Use tokens atomically (prevents race conditions)
  async useTokens(
    userId: string,
    chatId: string | null,
    modelId: string,
    usage: TokenUsage
  ): Promise<UseTokensResult> {
    const { data, error } = await supabase.rpc('use_tokens', {
      p_user_id: userId,
      p_chat_id: chatId,
      p_model_id: modelId,
      p_prompt_tokens: usage.prompt_tokens,
      p_completion_tokens: usage.completion_tokens,
      p_estimated_cost: usage.estimated_cost
    });

    if (error) {
      console.error('Error using tokens:', error);
      return { success: false, newTokensUsed: 0, newBudgetRemaining: 0 };
    }

    if (data && data.length > 0) {
      return {
        success: data[0].success,
        newTokensUsed: data[0].new_tokens_used,
        newBudgetRemaining: data[0].new_budget_remaining
      };
    }

    return { success: false, newTokensUsed: 0, newBudgetRemaining: 0 };
  },

  // Get token usage history for a user
  async getTokenUsageHistory(userId: string, limit = 50): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_token_usage')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error loading token usage history:', error);
      return [];
    }

    return data || [];
  },

  // Guest token operations (localStorage)
  getGuestTokensUsed(): number {
    return parseInt(localStorage.getItem(GUEST_TOKENS_KEY) || '0', 10);
  },

  setGuestTokensUsed(used: number): void {
    localStorage.setItem(GUEST_TOKENS_KEY, used.toString());
  },

  useGuestTokens(tokens: number): number {
    const currentUsed = this.getGuestTokensUsed();
    const newUsed = currentUsed + tokens;
    this.setGuestTokensUsed(newUsed);
    return newUsed;
  },

  getGuestBudgetRemaining(): number {
    return DEFAULT_GUEST_TOKEN_BUDGET - this.getGuestTokensUsed();
  },

  // Get configurable token budget from feature flags
  async getDefaultTokenBudget(): Promise<number> {
    const { data } = await supabase
      .from('feature_flags')
      .select('numeric_value')
      .eq('key', 'default_token_budget')
      .eq('enabled', true)
      .maybeSingle();

    return data?.numeric_value || DEFAULT_TOKEN_BUDGET;
  },

  async getGuestTokenBudget(): Promise<number> {
    const { data } = await supabase
      .from('feature_flags')
      .select('numeric_value')
      .eq('key', 'guest_token_budget')
      .eq('enabled', true)
      .maybeSingle();

    return data?.numeric_value || DEFAULT_GUEST_TOKEN_BUDGET;
  }
};
