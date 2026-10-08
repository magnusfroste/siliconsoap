// Keep in sync with supabase/functions/_shared/speakerLabel.ts (Deno cannot import from src/).
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Remove a leading speaker label ("[Name]:" or "Name:") that models copy from the history format.
 * Bracketed labels are always stripped; unbracketed only for known names or "Agent A/B/C". Mid-text names are kept. */
export function stripSpeakerLabel(text: string, names: string[] = []): string {
  if (!text) return text;
  const known = [...new Set(names.map((n) => n?.trim()).filter(Boolean))].sort((a, b) => b.length - a.length).map(escape);
  const alts = [...known, 'Agent [ABC]'].join('|');
  const bracketed = /^\s*(?:\*\*)?\[[^\]\n]{1,60}\](?:\*\*)?\s*:\s*/;
  const plain = new RegExp(`^\\s*(?:\\*\\*)?(?:${alts})(?:\\*\\*)?\\s*:(?:\\*\\*)?\\s*`, 'i');
  let out = text;
  for (let i = 0; i < 2; i++) {
    const next = out.replace(bracketed, '').replace(plain, '');
    if (next === out) break;
    out = next;
  }
  return out.trim() ? out : text;
}
