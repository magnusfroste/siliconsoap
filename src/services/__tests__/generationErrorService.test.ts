import { describe, it, expect } from 'vitest';
import { describeGenerationError, noCreditsMessage, NETWORK_ERROR_MESSAGE, GENERIC_ERROR_MESSAGE } from '../generationErrorService';
import { GenerationApiError } from '@/utils/openRouter/api/completions';

describe('describeGenerationError', () => {
  it('shows a friendly server message as-is and offers sign-in for DAILY_LIMIT', () => {
    const msg = "You've reached today's limit for free debates from this network. Sign in to keep going.";
    expect(describeGenerationError(new GenerationApiError(msg, 'DAILY_LIMIT'))).toEqual({ title: "The debate couldn't start", message: msg, action: 'signin' });
  });
  it('offers retry for other friendly codes', () => {
    const r = describeGenerationError(new GenerationApiError('Too large', 'REQUEST_TOO_LARGE'));
    expect(r.message).toBe('Too large');
    expect(r.action).toBe('retry');
  });
  it('maps fetch failures to the network message', () => {
    expect(describeGenerationError(new TypeError('Failed to fetch')).message).toBe(NETWORK_ERROR_MESSAGE);
    const f = new Error('Failed to send a request to the Edge Function'); f.name = 'FunctionsFetchError';
    expect(describeGenerationError(f).message).toBe(NETWORK_ERROR_MESSAGE);
  });
  it('maps anything else to the generic message', () => {
    expect(describeGenerationError(new Error('Scenario not found')).message).toBe(GENERIC_ERROR_MESSAGE);
    expect(describeGenerationError(undefined).action).toBe('retry');
  });
});

describe('noCreditsMessage', () => {
  it('differs for guests and signed-in users', () => {
    expect(noCreditsMessage(true)).toBe("You've used your free debates. Sign up to get more.");
    expect(noCreditsMessage(false)).toBe('No credits remaining. Please purchase more credits to continue.');
  });
});
