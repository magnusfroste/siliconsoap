// Token usage domain models

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  estimated_cost: number;
}

export interface UserTokenBudget {
  token_budget: number;
  tokens_used: number;
  budget_remaining: number;
}

export interface TokenState {
  tokenBudget: number;
  tokensUsed: number;
  budgetRemaining: number;
  loading: boolean;
}

export const DEFAULT_TOKEN_BUDGET = 100000;
export const GUEST_TOKENS_KEY = 'guest_tokens_used';
export const DEFAULT_GUEST_TOKEN_BUDGET = 50000;
