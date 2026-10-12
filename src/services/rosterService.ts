import type { CuratedModel } from '@/models/model';
export const shortModelName = (name: string) => name.replace(/^[^:]+:\s*/, '');
export const contextLabel = (n: number | null) => n ? (n >= 1000000 ? `${Math.round(n / 1000000 * 10) / 10}M` : `${Math.round(n / 1000)}K`) : '—';
export const isNewModel = (created: string, now = Date.now()) => { const age = now - Date.parse(created); return age >= 0 && age < 7 * 86400000; };
export const priceLabel = (tier: string | null) => tier === 'elite' ? 'Elite · account' : tier ? tier[0].toUpperCase() + tier.slice(1) : '—';
export const originSections = [{id:'EU',name:'Europe'},{id:'US',name:'United States'},{id:'CN',name:'China'},{id:'OTHER',name:'Other'}];
export function filterRoster(models: CuratedModel[], search: string, license: string, fast: boolean, tier: string) {
 return models.filter(m => `${m.display_name} ${m.model_id}`.toLowerCase().includes(search.toLowerCase()) && (license === 'all' || (license === 'open-weight' ? m.license_type === 'open-weight' : m.license_type !== 'open-weight')) && (!fast || m.speed_rating?.toLowerCase() === 'fast') && (tier === 'all' || (tier === 'budget' && m.price_tier === 'free') || m.price_tier === tier));
}
