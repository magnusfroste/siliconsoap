import { useState, useEffect } from 'react';
import { creditsService } from '@/services';
import { CreditState } from '@/models/credits';

export const useCredits = (userId: string | null | undefined) => {
  const [creditData, setCreditData] = useState<CreditState>({
    creditsRemaining: 0,
    creditsUsed: 0,
    loading: true,
  });

  // Load credits on mount and when user changes
  useEffect(() => {
    loadCredits();
  }, [userId]);

  // Listen for credit changes from other components
  useEffect(() => {
    const handleCreditsChanged = () => {
      loadCredits();
    };

    window.addEventListener('creditsChanged', handleCreditsChanged);
    return () => window.removeEventListener('creditsChanged', handleCreditsChanged);
  }, [userId]);

  const loadCredits = async () => {
    setCreditData(prev => ({ ...prev, loading: true }));

    try {
      const state = await creditsService.loadCredits(userId || null);
      setCreditData(state);
    } catch (error) {
      console.error('Error loading credits:', error);
      setCreditData({ creditsRemaining: 0, creditsUsed: 0, loading: false });
    }
  };

  const hasCredits = (): boolean => {
    return creditsService.canStartConversation(creditData.creditsRemaining);
  };

  const useCredit = async (): Promise<boolean> => {
    if (!hasCredits()) return false;

    const result = await creditsService.useCredit(
      userId || null,
      creditData.creditsRemaining,
      creditData.creditsUsed
    );

    if (result.success) {
      setCreditData(prev => ({
        ...prev,
        creditsRemaining: result.newRemaining,
        creditsUsed: result.newUsed,
      }));
    }

    return result.success;
  };

  const refreshCredits = () => {
    loadCredits();
  };

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
