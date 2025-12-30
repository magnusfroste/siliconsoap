// Credits Repository - handles all credits data access
import { supabase } from '@/integrations/supabase/client';
import { UserCredits, GUEST_CREDITS_KEY, DEFAULT_GUEST_CREDITS, DEFAULT_USER_CREDITS } from '@/models/credits';

export const creditsRepository = {
  // Get credits for a user
  async getUserCredits(userId: string): Promise<UserCredits | null> {
    const { data, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error loading credits:', error);
      return null;
    }

    return data ? {
      id: data.id,
      user_id: data.user_id,
      credits_remaining: data.credits_remaining,
      credits_used: data.credits_used,
      created_at: data.created_at || undefined,
      updated_at: data.updated_at || undefined
    } : null;
  },

  // Create initial credits for a user
  async createUserCredits(userId: string, initialCredits: number): Promise<UserCredits | null> {
    const { data, error } = await supabase
      .from('user_credits')
      .insert({
        user_id: userId,
        credits_remaining: initialCredits,
        credits_used: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating credits:', error);
      return null;
    }

    return data ? {
      id: data.id,
      user_id: data.user_id,
      credits_remaining: data.credits_remaining,
      credits_used: data.credits_used
    } : null;
  },

  // Use a credit atomically (prevents race conditions)
  async useCredit(userId: string): Promise<{ success: boolean; newRemaining: number; newUsed: number }> {
    const { data, error } = await supabase.rpc('use_credit', { p_user_id: userId });

    if (error) {
      console.error('Error using credit:', error);
      return { success: false, newRemaining: 0, newUsed: 0 };
    }

    if (data && data.length > 0) {
      return {
        success: data[0].success,
        newRemaining: data[0].new_remaining,
        newUsed: data[0].new_used
      };
    }

    return { success: false, newRemaining: 0, newUsed: 0 };
  },

  // Guest credits operations (localStorage)
  getGuestCreditsUsed(): number {
    return parseInt(localStorage.getItem(GUEST_CREDITS_KEY) || '0', 10);
  },

  setGuestCreditsUsed(used: number): void {
    localStorage.setItem(GUEST_CREDITS_KEY, used.toString());
  },

  useGuestCredit(): number {
    const currentUsed = this.getGuestCreditsUsed();
    const newUsed = currentUsed + 1;
    this.setGuestCreditsUsed(newUsed);
    return newUsed;
  },

  // Get configurable credit amounts from feature flags
  async getGuestCreditsAmount(): Promise<number> {
    const { data } = await supabase
      .from('feature_flags')
      .select('numeric_value')
      .eq('key', 'guest_credits_amount')
      .eq('enabled', true)
      .maybeSingle();

    return data?.numeric_value || DEFAULT_GUEST_CREDITS;
  },

  async getFreeCreditsAmount(): Promise<number> {
    const { data } = await supabase
      .from('feature_flags')
      .select('numeric_value')
      .eq('key', 'free_credits_amount')
      .eq('enabled', true)
      .maybeSingle();

    return data?.numeric_value || DEFAULT_USER_CREDITS;
  },

  // Get tokens per credit conversion rate
  async getTokensPerCredit(): Promise<number> {
    const { data } = await supabase
      .from('feature_flags')
      .select('numeric_value')
      .eq('key', 'tokens_per_credit')
      .eq('enabled', true)
      .maybeSingle();

    return data?.numeric_value || 100000; // Default: 100K tokens = 1 credit
  },

  // Use tokens and deduct credits when threshold reached
  async useTokensAndDeductCredits(
    userId: string,
    tokensUsed: number
  ): Promise<{ success: boolean; creditsDeducted: number; newCreditsRemaining: number }> {
    const tokensPerCredit = await this.getTokensPerCredit();
    
    // Get current user credits
    const { data: userCredits, error: fetchError } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError || !userCredits) {
      console.error('Error fetching user credits:', fetchError);
      return { success: false, creditsDeducted: 0, newCreditsRemaining: 0 };
    }

    // Calculate new tokens used and how many credits to deduct
    const newTokensUsed = userCredits.tokens_used + tokensUsed;
    const creditsToDeduct = Math.floor(newTokensUsed / tokensPerCredit);
    const remainingTokens = newTokensUsed % tokensPerCredit;

    // Check if user has enough credits
    if (creditsToDeduct > userCredits.credits_remaining) {
      return { 
        success: false, 
        creditsDeducted: 0, 
        newCreditsRemaining: userCredits.credits_remaining 
      };
    }

    // Update credits and token counter
    const { error: updateError } = await supabase
      .from('user_credits')
      .update({
        credits_remaining: userCredits.credits_remaining - creditsToDeduct,
        credits_used: userCredits.credits_used + creditsToDeduct,
        tokens_used: remainingTokens,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating credits:', updateError);
      return { success: false, creditsDeducted: 0, newCreditsRemaining: userCredits.credits_remaining };
    }

    return {
      success: true,
      creditsDeducted: creditsToDeduct,
      newCreditsRemaining: userCredits.credits_remaining - creditsToDeduct
    };
  }
};
