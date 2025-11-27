// Credits domain models

export interface UserCredits {
  id?: string;
  user_id: string;
  credits_remaining: number;
  credits_used: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreditState {
  creditsRemaining: number;
  creditsUsed: number;
  loading: boolean;
}

export const GUEST_CREDITS_KEY = 'guest_credits_used';
export const DEFAULT_GUEST_CREDITS = 3;
export const DEFAULT_USER_CREDITS = 10;
