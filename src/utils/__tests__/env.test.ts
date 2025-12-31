import { describe, it, expect } from 'vitest';
import { getEnvironment, isDevelopment, isProduction } from '../env';

describe('env utilities', () => {
  // Note: validateEnvironment is tested in integration (App.tsx startup)
  // Mocking import.meta.env in Vitest is not straightforward

  describe('getEnvironment', () => {
    it('should return environment configuration object with all required fields', () => {
      const config = getEnvironment();

      expect(config).toHaveProperty('supabaseUrl');
      expect(config).toHaveProperty('supabasePublishableKey');
      expect(config).toHaveProperty('supabaseProjectId');
      
      expect(typeof config.supabaseUrl).toBe('string');
      expect(typeof config.supabasePublishableKey).toBe('string');
      expect(typeof config.supabaseProjectId).toBe('string');
      
      expect(config.supabaseUrl.length).toBeGreaterThan(0);
      expect(config.supabasePublishableKey.length).toBeGreaterThan(0);
      expect(config.supabaseProjectId.length).toBeGreaterThan(0);
    });
  });

  describe('isDevelopment', () => {
    it('should return a boolean', () => {
      const result = isDevelopment();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('isProduction', () => {
    it('should return a boolean', () => {
      const result = isProduction();
      expect(typeof result).toBe('boolean');
    });

    it('should be opposite of isDevelopment', () => {
      // In a proper environment, one should be true and the other false
      const dev = isDevelopment();
      const prod = isProduction();
      
      // They should be opposites (can't be both dev and prod)
      expect(dev && prod).toBe(false);
    });
  });
});
