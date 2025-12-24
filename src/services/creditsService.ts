// Credits Service - business logic for credit system (credits-only, no BYOK)
import { creditsRepository } from '@/repositories';
import { CreditState } from '@/models/credits';

export const creditsService = {
  // Check if user has credits
  canStartConversation(creditsRemaining: number): boolean {
    return creditsRemaining > 0;
  },

  // Load credits for a user
  async loadCredits(userId: string | null): Promise<CreditState> {
    if (userId) {
      return this.loadUserCredits(userId);
    }
    return this.loadGuestCredits();
  },

  // Load credits for logged-in user
  async loadUserCredits(userId: string): Promise<CreditState> {
    const credits = await creditsRepository.getUserCredits(userId);

    if (credits) {
      return {
        creditsRemaining: credits.credits_remaining,
        creditsUsed: credits.credits_used,
        loading: false
      };
    }

    // User doesn't have credits record yet, return default
    const initialCredits = await creditsRepository.getFreeCreditsAmount();
    return {
      creditsRemaining: initialCredits,
      creditsUsed: 0,
      loading: false
    };
  },

  // Load credits for guest
  async loadGuestCredits(): Promise<CreditState> {
    const maxCredits = await creditsRepository.getGuestCreditsAmount();
    const usedCredits = creditsRepository.getGuestCreditsUsed();

    return {
      creditsRemaining: Math.max(0, maxCredits - usedCredits),
      creditsUsed: usedCredits,
      loading: false
    };
  },

  // Use a credit
  async useCredit(
    userId: string | null,
    currentRemaining: number,
    currentUsed: number
  ): Promise<{ success: boolean; newRemaining: number; newUsed: number }> {
    if (currentRemaining <= 0) {
      return { success: false, newRemaining: currentRemaining, newUsed: currentUsed };
    }

    if (userId) {
      // Check if user has credit record
      const credits = await creditsRepository.getUserCredits(userId);

      if (!credits) {
        // Create initial record with one credit used
        const initialCredits = await creditsRepository.getFreeCreditsAmount();
        await creditsRepository.createUserCredits(userId, initialCredits - 1);
        
        return {
          success: true,
          newRemaining: initialCredits - 1,
          newUsed: 1
        };
      }

      // Use atomic credit deduction to prevent race conditions
      const result = await creditsRepository.useCredit(userId);
      
      if (result.success) {
        // Notify other components
        window.dispatchEvent(new CustomEvent('creditsChanged'));
      }

      return result;
    } else {
      // Guest user
      const newUsed = creditsRepository.useGuestCredit();
      const maxCredits = await creditsRepository.getGuestCreditsAmount();
      
      window.dispatchEvent(new CustomEvent('creditsChanged'));
      
      return {
        success: true,
        newRemaining: Math.max(0, maxCredits - newUsed),
        newUsed
      };
    }
  },

  // Check if credits are exhausted
  isCreditsExhausted(creditsRemaining: number): boolean {
    return creditsRemaining <= 0;
  }
};
