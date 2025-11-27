import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const GUEST_CREDITS_KEY = 'guest_credits_used';

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
  const [guestMaxCredits, setGuestMaxCredits] = useState<number>(3);

  // Fetch guest credits config from feature flags
  useEffect(() => {
    const fetchGuestCreditsConfig = async () => {
      const { data } = await supabase
        .from('feature_flags')
        .select('numeric_value')
        .eq('key', 'guest_credits_amount')
        .eq('enabled', true)
        .maybeSingle();
      
      if (data?.numeric_value) {
        setGuestMaxCredits(data.numeric_value);
      }
    };
    
    fetchGuestCreditsConfig();
  }, []);

  // Load credits on mount and when user changes
  useEffect(() => {
    loadCredits();
  }, [userId, guestMaxCredits]);

  // Listen for credit changes from other components
  useEffect(() => {
    const handleCreditsChanged = () => {
      loadCredits();
    };

    window.addEventListener('creditsChanged', handleCreditsChanged);
    return () => window.removeEventListener('creditsChanged', handleCreditsChanged);
  }, [userId, guestMaxCredits]);

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
        // Fetch initial credits from feature flag
        const { data: flagData } = await supabase
          .from('feature_flags')
          .select('numeric_value')
          .eq('key', 'free_credits_amount')
          .eq('enabled', true)
          .maybeSingle();
        
        const initialCredits = flagData?.numeric_value || 10;
        
        setCreditData({
          creditsRemaining: initialCredits,
          creditsUsed: 0,
          loading: false,
        });
      }
    } else {
      // Guest user: load from localStorage
      const usedCredits = parseInt(localStorage.getItem(GUEST_CREDITS_KEY) || '0', 10);
      setCreditData({
        creditsRemaining: Math.max(0, guestMaxCredits - usedCredits),
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
      // First, check if credit record exists
      const { data: existingCredits } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!existingCredits) {
        // Create initial credit record if it doesn't exist
        // Fetch initial credits from feature flag
        const { data: flagData } = await supabase
          .from('feature_flags')
          .select('numeric_value')
          .eq('key', 'free_credits_amount')
          .eq('enabled', true)
          .maybeSingle();
        
        const initialCredits = flagData?.numeric_value || 10;
        
        const { error: insertError } = await supabase
          .from('user_credits')
          .insert({
            user_id: userId,
            credits_remaining: initialCredits - 1,
            credits_used: 1,
          });

        if (insertError) {
          console.error('Error creating credit record:', insertError);
          return false;
        }

        setCreditData({
          creditsRemaining: initialCredits - 1,
          creditsUsed: 1,
          loading: false,
        });
        
        window.dispatchEvent(new CustomEvent('creditsChanged'));
        return true;
      }

      // Logged-in user: update existing database record
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