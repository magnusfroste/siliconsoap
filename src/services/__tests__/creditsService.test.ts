import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { creditsService } from '../creditsService';
import { creditsRepository } from '@/repositories';

// Mock the repository
vi.mock('@/repositories', () => ({
  creditsRepository: {
    getUserCredits: vi.fn(),
    getFreeCreditsAmount: vi.fn(),
    getGuestCreditsAmount: vi.fn(),
    getGuestCreditsUsed: vi.fn(),
    useGuestCredit: vi.fn(),
    createUserCredits: vi.fn(),
    useCredit: vi.fn(),
    useTokensAndDeductCredits: vi.fn(),
    getTokensPerCredit: vi.fn(),
  }
}));

describe('creditsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.dispatchEvent
    vi.spyOn(window, 'dispatchEvent').mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('canStartConversation', () => {
    it('should return true when credits remaining > 0', () => {
      expect(creditsService.canStartConversation(5)).toBe(true);
      expect(creditsService.canStartConversation(1)).toBe(true);
    });

    it('should return false when credits remaining = 0', () => {
      expect(creditsService.canStartConversation(0)).toBe(false);
    });

    it('should return false when credits remaining < 0', () => {
      expect(creditsService.canStartConversation(-1)).toBe(false);
    });
  });

  describe('loadCredits', () => {
    it('should load user credits when userId is provided', async () => {
      const userId = 'user-123';
      vi.mocked(creditsRepository.getUserCredits).mockResolvedValue({
        user_id: userId,
        credits_remaining: 10,
        credits_used: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      const result = await creditsService.loadCredits(userId);

      expect(result).toEqual({
        creditsRemaining: 10,
        creditsUsed: 3,
        loading: false
      });
      expect(creditsRepository.getUserCredits).toHaveBeenCalledWith(userId);
    });

    it('should load guest credits when userId is null', async () => {
      vi.mocked(creditsRepository.getGuestCreditsAmount).mockResolvedValue(5);
      vi.mocked(creditsRepository.getGuestCreditsUsed).mockReturnValue(2);

      const result = await creditsService.loadCredits(null);

      expect(result).toEqual({
        creditsRemaining: 3,
        creditsUsed: 2,
        loading: false
      });
      expect(creditsRepository.getGuestCreditsAmount).toHaveBeenCalled();
      expect(creditsRepository.getGuestCreditsUsed).toHaveBeenCalled();
    });
  });

  describe('loadUserCredits', () => {
    it('should return existing user credits', async () => {
      const userId = 'user-123';
      vi.mocked(creditsRepository.getUserCredits).mockResolvedValue({
        user_id: userId,
        credits_remaining: 7,
        credits_used: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      const result = await creditsService.loadUserCredits(userId);

      expect(result).toEqual({
        creditsRemaining: 7,
        creditsUsed: 3,
        loading: false
      });
    });

    it('should return default credits for new user', async () => {
      const userId = 'new-user';
      vi.mocked(creditsRepository.getUserCredits).mockResolvedValue(null);
      vi.mocked(creditsRepository.getFreeCreditsAmount).mockResolvedValue(10);

      const result = await creditsService.loadUserCredits(userId);

      expect(result).toEqual({
        creditsRemaining: 10,
        creditsUsed: 0,
        loading: false
      });
    });
  });

  describe('loadGuestCredits', () => {
    it('should calculate remaining credits correctly', async () => {
      vi.mocked(creditsRepository.getGuestCreditsAmount).mockResolvedValue(5);
      vi.mocked(creditsRepository.getGuestCreditsUsed).mockReturnValue(2);

      const result = await creditsService.loadGuestCredits();

      expect(result).toEqual({
        creditsRemaining: 3,
        creditsUsed: 2,
        loading: false
      });
    });

    it('should not return negative credits', async () => {
      vi.mocked(creditsRepository.getGuestCreditsAmount).mockResolvedValue(5);
      vi.mocked(creditsRepository.getGuestCreditsUsed).mockReturnValue(10);

      const result = await creditsService.loadGuestCredits();

      expect(result.creditsRemaining).toBe(0);
      expect(result.creditsUsed).toBe(10);
    });
  });

  describe('useCredit - logged-in user', () => {
    it('should fail when no credits remaining', async () => {
      const result = await creditsService.useCredit('user-123', 0, 5);

      expect(result).toEqual({
        success: false,
        newRemaining: 0,
        newUsed: 5
      });
      expect(creditsRepository.useCredit).not.toHaveBeenCalled();
    });

    it('should create initial record for new user', async () => {
      const userId = 'new-user';
      vi.mocked(creditsRepository.getUserCredits).mockResolvedValue(null);
      vi.mocked(creditsRepository.getFreeCreditsAmount).mockResolvedValue(10);
      vi.mocked(creditsRepository.createUserCredits).mockResolvedValue(undefined);

      const result = await creditsService.useCredit(userId, 10, 0);

      expect(result).toEqual({
        success: true,
        newRemaining: 9,
        newUsed: 1
      });
      expect(creditsRepository.createUserCredits).toHaveBeenCalledWith(userId, 9);
    });

    it('should use atomic credit deduction for existing user', async () => {
      const userId = 'user-123';
      vi.mocked(creditsRepository.getUserCredits).mockResolvedValue({
        user_id: userId,
        credits_remaining: 5,
        credits_used: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      vi.mocked(creditsRepository.useCredit).mockResolvedValue({
        success: true,
        newRemaining: 4,
        newUsed: 6
      });

      const result = await creditsService.useCredit(userId, 5, 5);

      expect(result).toEqual({
        success: true,
        newRemaining: 4,
        newUsed: 6
      });
      expect(creditsRepository.useCredit).toHaveBeenCalledWith(userId);
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'creditsChanged' })
      );
    });

    it('should not dispatch event when credit deduction fails', async () => {
      const userId = 'user-123';
      vi.mocked(creditsRepository.getUserCredits).mockResolvedValue({
        user_id: userId,
        credits_remaining: 1,
        credits_used: 9,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      vi.mocked(creditsRepository.useCredit).mockResolvedValue({
        success: false,
        newRemaining: 1,
        newUsed: 9
      });

      await creditsService.useCredit(userId, 1, 9);

      expect(window.dispatchEvent).not.toHaveBeenCalled();
    });
  });

  describe('useCredit - guest user', () => {
    it('should fail when no credits remaining', async () => {
      const result = await creditsService.useCredit(null, 0, 5);

      expect(result).toEqual({
        success: false,
        newRemaining: 0,
        newUsed: 5
      });
    });

    it('should use guest credit successfully', async () => {
      vi.mocked(creditsRepository.useGuestCredit).mockReturnValue(3);
      vi.mocked(creditsRepository.getGuestCreditsAmount).mockResolvedValue(5);

      const result = await creditsService.useCredit(null, 3, 2);

      expect(result).toEqual({
        success: true,
        newRemaining: 2,
        newUsed: 3
      });
      expect(creditsRepository.useGuestCredit).toHaveBeenCalled();
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'creditsChanged' })
      );
    });

    it('should not return negative remaining credits', async () => {
      vi.mocked(creditsRepository.useGuestCredit).mockReturnValue(10);
      vi.mocked(creditsRepository.getGuestCreditsAmount).mockResolvedValue(5);

      const result = await creditsService.useCredit(null, 1, 9);

      expect(result.newRemaining).toBe(0);
    });
  });

  describe('isCreditsExhausted', () => {
    it('should return true when credits = 0', () => {
      expect(creditsService.isCreditsExhausted(0)).toBe(true);
    });

    it('should return true when credits < 0', () => {
      expect(creditsService.isCreditsExhausted(-1)).toBe(true);
    });

    it('should return false when credits > 0', () => {
      expect(creditsService.isCreditsExhausted(1)).toBe(false);
      expect(creditsService.isCreditsExhausted(10)).toBe(false);
    });
  });

  describe('useTokensForCredit', () => {
    it('should return success for guest users without deducting credits', async () => {
      const result = await creditsService.useTokensForCredit(null, 1000);

      expect(result).toEqual({
        success: true,
        creditsDeducted: 0,
        newCreditsRemaining: 0
      });
      expect(creditsRepository.useTokensAndDeductCredits).not.toHaveBeenCalled();
    });

    it('should deduct credits based on token usage for logged-in users', async () => {
      const userId = 'user-123';
      vi.mocked(creditsRepository.useTokensAndDeductCredits).mockResolvedValue({
        success: true,
        creditsDeducted: 2,
        newCreditsRemaining: 8
      });

      const result = await creditsService.useTokensForCredit(userId, 2000);

      expect(result).toEqual({
        success: true,
        creditsDeducted: 2,
        newCreditsRemaining: 8
      });
      expect(creditsRepository.useTokensAndDeductCredits).toHaveBeenCalledWith(userId, 2000);
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'creditsChanged' })
      );
    });

    it('should not dispatch event when no credits deducted', async () => {
      const userId = 'user-123';
      vi.mocked(creditsRepository.useTokensAndDeductCredits).mockResolvedValue({
        success: true,
        creditsDeducted: 0,
        newCreditsRemaining: 10
      });

      await creditsService.useTokensForCredit(userId, 100);

      expect(window.dispatchEvent).not.toHaveBeenCalled();
    });
  });

  describe('getTokensPerCredit', () => {
    it('should return tokens per credit ratio', async () => {
      vi.mocked(creditsRepository.getTokensPerCredit).mockResolvedValue(1000);

      const result = await creditsService.getTokensPerCredit();

      expect(result).toBe(1000);
      expect(creditsRepository.getTokensPerCredit).toHaveBeenCalled();
    });
  });
});
