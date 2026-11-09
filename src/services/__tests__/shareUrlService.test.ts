import { describe, it, expect } from 'vitest';
import { publicShareUrl, shareIdFromUrl } from '../shareUrlService';

describe('shareUrlService', () => {
  it('builds the share-host URL', () => {
    expect(publicShareUrl('c0e50abb')).toBe('https://share.siliconsoap.com/c0e50abb');
  });
  it('extracts id from share-host URL', () => {
    expect(shareIdFromUrl('https://share.siliconsoap.com/c0e50abb')).toBe('c0e50abb');
  });
  it('extracts id from /shared/ URL', () => {
    expect(shareIdFromUrl('http://localhost:8080/shared/abc123')).toBe('abc123');
  });
  it('returns empty for unrelated URL', () => {
    expect(shareIdFromUrl('https://siliconsoap.com/')).toBe('');
  });
});
