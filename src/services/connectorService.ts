import { connectorRepository, type StoredConnector } from '@/repositories/connectorRepository';
const inflight = new Map<string, Promise<{ panels_moved: number; credits_added: number }>>();
export const connectorService = {
  async create(userId?: string): Promise<StoredConnector> {
    const result = await connectorRepository.create();
    const link = { url: result.connector_url, claimedBy: userId };
    connectorRepository.save(link);
    return link;
  },
  async claim(link: StoredConnector, userId: string) {
    const key = new URL(link.url).searchParams.get('key');
    if (!key || !/^sk_guest_[A-Za-z0-9]{32}$/.test(key)) throw new Error('This connector link cannot be claimed.');
    const id = `${userId}:${link.url}`;
    let pending = inflight.get(id);
    if (!pending) { pending = connectorRepository.claim(key); inflight.set(id, pending); }
    try { const result = await pending; connectorRepository.save({ ...link, claimedBy: userId }); return result; }
    finally { inflight.delete(id); }
  },
};
