import { useState, useEffect, useRef, useCallback } from 'react';
import { tokenService } from '@/services/tokenService';
import { TokenState, TokenUsage } from '@/models/tokens';

export const useTokens = (userId: string | null | undefined) => {
  const [tokenState, setTokenState] = useState<TokenState>({
    tokenBudget: 0,
    tokensUsed: 0,
    budgetRemaining: 0,
    loading: true,
  });
  
  const isMounted = useRef(true);
  const isLoading = useRef(false);

  const loadTokens = useCallback(async () => {
    if (isLoading.current) return;
    isLoading.current = true;
    
    setTokenState(prev => ({ ...prev, loading: true }));

    try {
      const state = await tokenService.loadTokenState(userId || null);
      if (isMounted.current) {
        setTokenState(state);
      }
    } catch (error) {
      console.error('Error loading tokens:', error);
      if (isMounted.current) {
        setTokenState({ tokenBudget: 0, tokensUsed: 0, budgetRemaining: 0, loading: false });
      }
    } finally {
      isLoading.current = false;
    }
  }, [userId]);

  useEffect(() => {
    isMounted.current = true;
    loadTokens();
    
    return () => {
      isMounted.current = false;
    };
  }, [loadTokens]);

  // Listen for token changes from other components
  useEffect(() => {
    const handleTokensChanged = () => {
      loadTokens();
    };

    window.addEventListener('tokensChanged', handleTokensChanged);
    return () => window.removeEventListener('tokensChanged', handleTokensChanged);
  }, [loadTokens]);

  const hasBudget = useCallback((estimatedTokens: number = 5000): boolean => {
    return tokenService.canStartConversation(tokenState.budgetRemaining, estimatedTokens);
  }, [tokenState.budgetRemaining]);

  const useTokensForCall = useCallback(async (
    chatId: string | null,
    modelId: string,
    usage: TokenUsage
  ): Promise<boolean> => {
    const result = await tokenService.useTokens(
      userId || null,
      chatId,
      modelId,
      usage
    );

    if (isMounted.current) {
      setTokenState(result.newState);
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('tokensChanged'));
    }

    return result.success;
  }, [userId]);

  const refreshTokens = useCallback(() => {
    loadTokens();
  }, [loadTokens]);

  return {
    tokenBudget: tokenState.tokenBudget,
    tokensUsed: tokenState.tokensUsed,
    budgetRemaining: tokenState.budgetRemaining,
    loading: tokenState.loading,
    hasBudget,
    useTokensForCall,
    refreshTokens,
    isGuest: !userId,
    usagePercentage: tokenService.getUsagePercentage(tokenState.tokensUsed, tokenState.tokenBudget),
    formatTokens: tokenService.formatTokens,
    isBudgetExhausted: tokenService.isBudgetExhausted(tokenState.budgetRemaining),
  };
};
