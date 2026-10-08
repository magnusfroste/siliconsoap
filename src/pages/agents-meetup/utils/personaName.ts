import { profiles as fallbackProfiles } from '../constants';

/** Resolve a persona slug to its display name: loaded profiles, then built-in list, then title case. */
export function personaDisplayName(slug: string | undefined | null, loaded: { id: string; name: string }[] = []) {
  if (!slug) return '';
  const hit = loaded.find(p => p.id === slug) || fallbackProfiles.find(p => p.id === slug);
  if (hit) return hit.name;
  return slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
