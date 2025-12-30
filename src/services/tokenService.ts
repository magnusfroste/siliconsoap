// Token Service - business logic for token tracking
import { tokenRepository } from '@/repositories/tokenRepository';
import { TokenState, TokenUsage, DEFAULT_TOKEN_BUDGET, DEFAULT_GUEST_TOKEN_BUDGET } from '@/models/tokens';

export interface TokenCostEstimate {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

export const tokenService = {
  // Check if user has enough token budget to start a conversation
  canStartConversation(budgetRemaining: number, estimatedTokens: number = 5000): boolean {
    return budgetRemaining >= estimatedTokens;
  },

  // Load token state for a user
  async loadTokenState(userId: string | null): Promise<TokenState> {
    if (!userId) {
      return this.loadGuestTokenState();
    }
    return this.loadUserTokenState(userId);
  },

  async loadUserTokenState(userId: string): Promise<TokenState> {
    const budget = await tokenRepository.getUserTokenBudget(userId);
    
    if (!budget) {
      // New user - will be created with default budget on first use
      const defaultBudget = await tokenRepository.getDefaultTokenBudget();
      return {
        tokenBudget: defaultBudget,
        tokensUsed: 0,
        budgetRemaining: defaultBudget,
        loading: false
      };
    }

    return {
      tokenBudget: budget.tokenBudget,
      tokensUsed: budget.tokensUsed,
      budgetRemaining: budget.tokenBudget - budget.tokensUsed,
      loading: false
    };
  },

  async loadGuestTokenState(): Promise<TokenState> {
    const guestBudget = await tokenRepository.getGuestTokenBudget();
    const tokensUsed = tokenRepository.getGuestTokensUsed();

    return {
      tokenBudget: guestBudget,
      tokensUsed: tokensUsed,
      budgetRemaining: guestBudget - tokensUsed,
      loading: false
    };
  },

  // Use tokens after an API call
  async useTokens(
    userId: string | null,
    chatId: string | null,
    modelId: string,
    usage: TokenUsage
  ): Promise<{ success: boolean; newState: TokenState }> {
    if (!userId) {
      // Guest user - use localStorage
      const newUsed = tokenRepository.useGuestTokens(usage.total_tokens);
      const guestBudget = await tokenRepository.getGuestTokenBudget();
      
      return {
        success: newUsed <= guestBudget,
        newState: {
          tokenBudget: guestBudget,
          tokensUsed: newUsed,
          budgetRemaining: guestBudget - newUsed,
          loading: false
        }
      };
    }

    // Logged-in user - use database
    const result = await tokenRepository.useTokens(userId, chatId, modelId, usage);
    
    if (!result.success) {
      const currentState = await this.loadUserTokenState(userId);
      return { success: false, newState: currentState };
    }

    const budget = await tokenRepository.getUserTokenBudget(userId);
    
    return {
      success: true,
      newState: {
        tokenBudget: budget?.tokenBudget || DEFAULT_TOKEN_BUDGET,
        tokensUsed: result.newTokensUsed,
        budgetRemaining: result.newBudgetRemaining,
        loading: false
      }
    };
  },

  // Calculate cost estimate for a model
  calculateCost(
    modelId: string,
    promptTokens: number,
    completionTokens: number,
    priceInput: number,  // price per million tokens
    priceOutput: number  // price per million tokens
  ): number {
    const inputCost = (promptTokens / 1_000_000) * priceInput;
    const outputCost = (completionTokens / 1_000_000) * priceOutput;
    return inputCost + outputCost;
  },

  // Format tokens for display
  formatTokens(tokens: number): string {
    if (tokens >= 1_000_000) {
      return `${(tokens / 1_000_000).toFixed(1)}M`;
    }
    if (tokens >= 1_000) {
      return `${(tokens / 1_000).toFixed(1)}K`;
    }
    return tokens.toString();
  },

  // Format cost for display
  formatCost(cost: number): string {
    if (cost < 0.001) {
      return '<$0.001';
    }
    if (cost < 1) {
      return `$${cost.toFixed(4)}`;
    }
    return `$${cost.toFixed(2)}`;
  },

  // Get usage percentage
  getUsagePercentage(tokensUsed: number, tokenBudget: number): number {
    if (tokenBudget === 0) return 100;
    return Math.round((tokensUsed / tokenBudget) * 100);
  },

  // Check if budget is exhausted
  isBudgetExhausted(budgetRemaining: number): boolean {
    return budgetRemaining <= 0;
  }
};
