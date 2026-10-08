import { describe, it, expect } from 'vitest';
import { shouldAutoSaveGuest } from '../useGuestDebateSave';

describe('shouldAutoSaveGuest', () => {
  it('saves once when ready', () => expect(shouldAutoSaveGuest(true, null, 'c1')).toBe(true));
  it('never auto-retries the same debate', () => expect(shouldAutoSaveGuest(true, 'c1', 'c1')).toBe(false));
  it('waits until ready', () => expect(shouldAutoSaveGuest(false, null, 'c1')).toBe(false));
  it('allows a new debate', () => expect(shouldAutoSaveGuest(true, 'c1', 'c2')).toBe(true));
});
