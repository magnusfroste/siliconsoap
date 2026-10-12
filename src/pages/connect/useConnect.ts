import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/pages/agents-meetup/hooks/useAuth';
import { useCredits } from '@/pages/agents-meetup/hooks/useCredits';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { connectorRepository } from '@/repositories/connectorRepository';
import { connectorService } from '@/services/connectorService';
export function useConnect() {
  const { user, loading: authLoading } = useAuth();
  const { creditsRemaining, refreshCredits } = useCredits(user?.id);
  const { getNumericValue, isEnabled, loading: flagsLoading } = useFeatureFlags();
  const [link, setLink] = useState(connectorRepository.read);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [claimFailed, setClaimFailed] = useState(false);
  const attempted = useRef('');
  const queryClient = useQueryClient();
  const claim = async () => {
    if (!user || !link || link.claimedBy) return;
    setBusy(true); setError(''); setClaimFailed(false);
    try {
      const result = await connectorService.claim(link, user.id);
      setLink({ ...link, claimedBy: user.id });
      toast.success(`Your ${result.panels_moved} panels and ${result.credits_added} credits are now in your account`);
      await refreshCredits();
      queryClient.invalidateQueries({ queryKey: ['chatHistory'] });
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not keep your panels.'); setClaimFailed(true); }
    finally { setBusy(false); }
  };
  useEffect(() => {
    if (authLoading || !user || !link || link.claimedBy) return;
    const id = `${user.id}:${link.url}`;
    if (attempted.current === id) return;
    attempted.current = id;
    void claim();
  }, [authLoading, user?.id, link?.url, link?.claimedBy]);
  const create = async () => {
    if (link) { document.getElementById('connector-link')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    setBusy(true); setError('');
    try { setLink(await connectorService.create(user?.id)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not create your link.'); }
    finally { setBusy(false); }
  };
  const copy = async (text = link?.url) => {
    if (!text) return;
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { toast.error('Could not copy. Select the link and copy it manually.'); }
  };
  const freePanels = !flagsLoading && isEnabled('guest_credits_amount') ? getNumericValue('guest_credits_amount') : null;
  return { user, creditsRemaining, link, busy, error, copied, claimFailed, claim, create, copy, freePanels, loading: authLoading || flagsLoading };
}
