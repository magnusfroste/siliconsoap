import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
const storedSchema = z.object({ url: z.string().url(), claimedBy: z.string().optional() });
export type StoredConnector = z.infer<typeof storedSchema>;
const storageKey = 'siliconsoap_connector_link';
export const connectorRepository = {
  read(): StoredConnector | null {
    try { const raw = localStorage.getItem(storageKey); if (!raw) return null; const data = raw.startsWith('https://') ? { url: raw } : JSON.parse(raw); const parsed = storedSchema.safeParse(data); return parsed.success ? parsed.data : null; } catch { return null; }
  },
  save(link: StoredConnector) { localStorage.setItem(storageKey, JSON.stringify(link)); },
  async create(): Promise<{ connector_url: string; credits: number }> {
    const { data, error } = await supabase.functions.invoke('agent-guest-key', { body: {} });
    if (error) {
      const body = await error.context?.json?.().catch(() => null);
      throw new Error(body?.code === 'RATE_LIMIT' ? 'You can create 3 links per day' : body?.code === 'DISABLED' ? 'Connector links are paused right now.' : 'Could not create your link. Check your connection and try again.');
    }
    if (!data?.connector_url) throw new Error('Could not create your link. Try again.');
    return data;
  },
  async claim(key: string): Promise<{ panels_moved: number; credits_added: number }> {
    const { data, error } = await supabase.functions.invoke('claim-agent-key', { body: { key } });
    if (error) throw new Error('Could not keep your panels yet. Please retry.');
    return data;
  },
};
