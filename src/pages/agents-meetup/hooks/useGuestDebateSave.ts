import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type GuestSaveStatus = 'idle' | 'saving' | 'saved' | 'failed';

/** Auto-save fires at most once per debate key; failures wait for a manual retry. */
export function shouldAutoSaveGuest(ready: boolean, attemptedKey: string | null, key: string | undefined) {
  return ready && !!key && attemptedKey !== key;
}

export function useGuestDebateSave(ready: boolean, key: string | undefined, buildBody: () => unknown) {
  const [status, setStatus] = useState<GuestSaveStatus>('idle');
  const [shareId, setShareId] = useState<string | null>(null);
  const attemptedKey = useRef<string | null>(null);
  const inFlight = useRef(false);
  const bodyRef = useRef(buildBody);
  bodyRef.current = buildBody;

  const save = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setStatus('saving');
    try {
      const { data, error } = await supabase.functions.invoke('save-guest-debate', { body: bodyRef.current() });
      if (!error && data?.shareId) { setShareId(data.shareId); setStatus('saved'); }
      else { console.warn('Failed to save guest debate:', error || data?.error); setStatus('failed'); }
    } catch (err) {
      console.warn('Error saving guest debate:', err);
      setStatus('failed');
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    if (!shouldAutoSaveGuest(ready, attemptedKey.current, key)) return;
    attemptedKey.current = key!;
    void save();
  }, [ready, key, save]);

  const retry = useCallback(() => { if (status === 'failed') void save(); }, [status, save]);
  return { status, shareId, retry };
}
