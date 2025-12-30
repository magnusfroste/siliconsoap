import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from '../logger';

describe('Logger', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('should have all logging methods', () => {
    expect(logger.log).toBeDefined();
    expect(logger.info).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.debug).toBeDefined();
  });

  it('should always log errors', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logger.error('Test error');
    expect(errorSpy).toHaveBeenCalledWith('Test error');
    errorSpy.mockRestore();
  });
});
