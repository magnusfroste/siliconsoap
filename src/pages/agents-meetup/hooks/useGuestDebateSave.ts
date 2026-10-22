import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type GuestSaveStatus = 'idle' | 'saving' | 'saved' | 'failed';

/** Auto-save fires at most once per debate key; failures wait for a manual retry. */
export function shouldAutoSaveGuest(ready: boolean, attemptedKey: string | null, key: string | undefined, persistedShareId: string | null = null) {
  return ready && !!key && attemptedKey !== key && !persistedShareId;
}

function readSavedShare(key: string | undefined): string | null {
  try { return key ? localStorage.getItem(`guest_saved_share:${key}`) || null : null; }
  catch { return null; }
}

export function useGuestDebateSave(ready: boolean, key: string | undefined, buildBody: () => unknown) {
  const [result, setResult] = useState<{ key: string | undefined; status: GuestSaveStatus; shareId: string | null }>(() => {
    const shareId = readSavedShare(key);
    return { key, status: shareId ? 'saved' : 'idle', shareId };
  });
  const current = result.key === key ? result : { key, status: 'idle' as GuestSaveStatus, shareId: null };
  const attemptedKey = useRef<string | null>(null);
  const inFlight = useRef(false);
  const bodyRef = useRef(buildBody);
  bodyRef.current = buildBody;

  const save = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setResult({ key, status: 'saving', shareId: null });
    try {
      const body = bodyRef.current();
      const { data, error } = await supabase.functions.invoke('save-guest-debate', { body: { ...(body as Record<string, unknown>), clientKey: key } });
      if (!error && data?.shareId) {
        try { if (key) localStorage.setItem(`guest_saved_share:${key}`, data.shareId); } catch { /* Storage unavailable: retain mount-only protection. */ }
        setResult({ key, status: 'saved', shareId: data.shareId });
      }
      else { console.warn('Failed to save guest debate:', error || data?.error); setResult({ key, status: 'failed', shareId: null }); }
    } catch (err) {
      console.warn('Error saving guest debate:', err);
      setResult({ key, status: 'failed', shareId: null });
    } finally {
      inFlight.current = false;
    }
  }, [key]);

  useEffect(() => {
    const persistedShareId = readSavedShare(key);
    if (persistedShareId) {
      setResult({ key, status: 'saved', shareId: persistedShareId });
      return;
    }
    if (!key || !shouldAutoSaveGuest(ready, attemptedKey.current, key, persistedShareId)) return;
    attemptedKey.current = key;
    void save();
  }, [ready, key, save]);

  const retry = useCallback(() => { if (current.status === 'failed') void save(); }, [current.status, save]);
  return { status: current.status, shareId: current.shareId, retry };
}
