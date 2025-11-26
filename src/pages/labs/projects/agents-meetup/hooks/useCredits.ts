import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const GUEST_CREDITS_KEY = 'guest_credits_used';
const GUEST_MAX_CREDITS = 3;
const LOGGED_IN_INITIAL_CREDITS = 10;

interface CreditData {
  creditsRemaining: number;
  creditsUsed: number;
  loading: boolean;
}

export const useCredits = (userId: string | null | undefined) => {
  const [creditData, setCreditData] = useState<CreditData>({
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

    if (userId) {
      // Logged-in user: fetch from database
      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error loading credits:', error);
        setCreditData({ creditsRemaining: 0, creditsUsed: 0, loading: false });
        return;
      }

      if (data) {
        setCreditData({
          creditsRemaining: data.credits_remaining,
          creditsUsed: data.credits_used,
          loading: false,
        });
      } else {
        // User doesn't have credits record yet, will be created by trigger
        setCreditData({
          creditsRemaining: LOGGED_IN_INITIAL_CREDITS,
          creditsUsed: 0,
          loading: false,
        });
      }
    } else {
      // Guest user: load from localStorage
      const usedCredits = parseInt(localStorage.getItem(GUEST_CREDITS_KEY) || '0', 10);
      setCreditData({
        creditsRemaining: Math.max(0, GUEST_MAX_CREDITS - usedCredits),
        creditsUsed: usedCredits,
        loading: false,
      });
    }
  };

  const hasCredits = (): boolean => {
    return creditData.creditsRemaining > 0;
  };

  const useCredit = async (): Promise<boolean> => {
    if (!hasCredits()) return false;

    if (userId) {
      // Logged-in user: update database
      const { error } = await supabase
        .from('user_credits')
        .update({
          credits_remaining: creditData.creditsRemaining - 1,
          credits_used: creditData.creditsUsed + 1,
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error using credit:', error);
        return false;
      }

      setCreditData(prev => ({
        ...prev,
        creditsRemaining: prev.creditsRemaining - 1,
        creditsUsed: prev.creditsUsed + 1,
      }));
      
      // Notify other components of credit change
      window.dispatchEvent(new CustomEvent('creditsChanged'));
      return true;
    } else {
      // Guest user: update localStorage
      const newUsedCredits = creditData.creditsUsed + 1;
      localStorage.setItem(GUEST_CREDITS_KEY, newUsedCredits.toString());
      
      setCreditData(prev => ({
        ...prev,
        creditsRemaining: prev.creditsRemaining - 1,
        creditsUsed: prev.creditsUsed + 1,
      }));
      
      // Notify other components of credit change
      window.dispatchEvent(new CustomEvent('creditsChanged'));
      return true;
    }
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