// Credits Service - business logic for credit system
import { creditsRepository } from '@/repositories';
import { CreditState, DEFAULT_GUEST_CREDITS, DEFAULT_USER_CREDITS } from '@/models/credits';

const USER_API_KEY_STORAGE = 'userOpenRouterApiKey';

export const creditsService = {
  // Check if user has credits or BYOK API key
  canStartConversation(creditsRemaining: number): boolean {
    // If user has BYOK API key, they can always start
    if (this.hasByokApiKey()) {
      return true;
    }
    return creditsRemaining > 0;
  },

  // Check if user has their own API key
  hasByokApiKey(): boolean {
    return !!localStorage.getItem(USER_API_KEY_STORAGE);
  },

  // Get BYOK API key
  getByokApiKey(): string | null {
    return localStorage.getItem(USER_API_KEY_STORAGE);
  },

  // Save BYOK API key
  saveByokApiKey(apiKey: string): void {
    localStorage.setItem(USER_API_KEY_STORAGE, apiKey);
  },

  // Remove BYOK API key
  removeByokApiKey(): void {
    localStorage.removeItem(USER_API_KEY_STORAGE);
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

      // Update existing record
      const success = await creditsRepository.useCredit(userId, currentRemaining, currentUsed);
      
      if (success) {
        // Notify other components
        window.dispatchEvent(new CustomEvent('creditsChanged'));
        return {
          success: true,
          newRemaining: currentRemaining - 1,
          newUsed: currentUsed + 1
        };
      }

      return { success: false, newRemaining: currentRemaining, newUsed: currentUsed };
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

  // Check if should prompt for BYOK
  shouldPromptBYOK(creditsRemaining: number, isGuest: boolean): boolean {
    if (this.hasByokApiKey()) {
      return false;
    }
    return creditsRemaining <= 0;
  }
};
