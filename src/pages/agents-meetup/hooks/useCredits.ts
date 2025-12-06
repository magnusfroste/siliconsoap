import { useState, useEffect, useRef, useCallback } from 'react';
import { creditsService } from '@/services';
import { CreditState } from '@/models/credits';

export const useCredits = (userId: string | null | undefined) => {
  const [creditData, setCreditData] = useState<CreditState>({
    creditsRemaining: 0,
    creditsUsed: 0,
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
        setCreditData({ creditsRemaining: 0, creditsUsed: 0, loading: false });
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

  const hasCredits = useCallback((): boolean => {
    return creditsService.canStartConversation(creditData.creditsRemaining);
  }, [creditData.creditsRemaining]);

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

  return {
    creditsRemaining: creditData.creditsRemaining,
    creditsUsed: creditData.creditsUsed,
    loading: creditData.loading,
    hasCredits,
    useCredit,
    refreshCredits,
    isGuest: !userId,
  };
};
