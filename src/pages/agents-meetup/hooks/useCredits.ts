import { useState, useEffect, useRef, useCallback } from 'react';
import { creditsService } from '@/services';
import { CreditState } from '@/models/credits';
import { DEFAULT_TOKEN_BUDGET } from '@/models/tokens';

export const useCredits = (userId: string | null | undefined) => {
  const [creditData, setCreditData] = useState<CreditState>({
    creditsRemaining: 0,
    creditsUsed: 0,
    tokenBudget: DEFAULT_TOKEN_BUDGET, // Use default to avoid false negatives during loading
    tokensUsed: 0,
    loading: true,
  });
  
  const isMounted = useRef(true);
  const isLoading = useRef(false);

  const loadCredits = useCallback(async () => {
    // Prevent duplicate loads
    if (isLoading.current) return;
    isLoading.current = true;
    
    setCreditData(prev => ({ ...prev, loading: true }));

    try {
      const state = await creditsService.loadCredits(userId || null);
      if (isMounted.current) {
        setCreditData(state);
      }
    } catch (error) {
      console.error('Error loading credits:', error);
      if (isMounted.current) {
        // Keep reasonable defaults on error to avoid false negatives
        setCreditData({ 
          creditsRemaining: 0, 
          creditsUsed: 0, 
          tokenBudget: DEFAULT_TOKEN_BUDGET, 
          tokensUsed: 0, 
          loading: false 
        });
      }
    } finally {
      isLoading.current = false;
    }
  }, [userId]);

  // Load credits on mount and when user changes
  useEffect(() => {
    isMounted.current = true;
    loadCredits();
    
    return () => {
      isMounted.current = false;
    };
  }, [loadCredits]);

  // Listen for credit changes from other components
  useEffect(() => {
    const handleCreditsChanged = () => {
      loadCredits();
    };

    window.addEventListener('creditsChanged', handleCreditsChanged);
    return () => window.removeEventListener('creditsChanged', handleCreditsChanged);
  }, [loadCredits]);

  // For guests: check credits, for logged-in: check token budget
  const hasCredits = useCallback((): boolean => {
    // During loading, assume user has credits to avoid false negatives
    if (creditData.loading) {
      return true;
    }
    
    if (!userId) {
      // Guest: simple credit check
      return creditsService.canStartConversation(creditData.creditsRemaining);
    }
    
    // Logged-in user: check token budget
    // Also check credits_remaining as a fallback when token budget appears unset
    if (creditData.tokenBudget === 0) {
      // Token budget not loaded properly, fall back to credits check
      return creditData.creditsRemaining > 0;
    }
    
    return creditData.tokenBudget > creditData.tokensUsed;
  }, [userId, creditData.loading, creditData.creditsRemaining, creditData.tokenBudget, creditData.tokensUsed]);

  const useCredit = useCallback(async (): Promise<boolean> => {
    if (!hasCredits()) return false;

    const result = await creditsService.useCredit(
      userId || null,
      creditData.creditsRemaining,
      creditData.creditsUsed
    );

    if (result.success && isMounted.current) {
      setCreditData(prev => ({
        ...prev,
        creditsRemaining: result.newRemaining,
        creditsUsed: result.newUsed,
      }));
    }

    return result.success;
  }, [hasCredits, userId, creditData.creditsRemaining, creditData.creditsUsed]);

  const refreshCredits = useCallback(() => {
    loadCredits();
  }, [loadCredits]);

  // Calculate remaining token budget percentage for UI
  const tokenBudgetRemaining = creditData.tokenBudget - creditData.tokensUsed;
  const tokenBudgetPercentage = creditData.tokenBudget > 0 
    ? Math.max(0, Math.min(100, (tokenBudgetRemaining / creditData.tokenBudget) * 100))
    : 0;

  return {
    creditsRemaining: creditData.creditsRemaining,
    creditsUsed: creditData.creditsUsed,
    tokenBudget: creditData.tokenBudget,
    tokensUsed: creditData.tokensUsed,
    tokenBudgetRemaining,
    tokenBudgetPercentage,
    loading: creditData.loading,
    hasCredits,
    useCredit,
    refreshCredits,
    isGuest: !userId,
  };
};
