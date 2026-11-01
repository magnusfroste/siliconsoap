// Pure helpers for shared-debate social previews (og-image + prerender).

export const OG_FALLBACK_IMAGE = 'https://siliconsoap.com/og-image.png';
export const DESCRIPTION_MAX = 200;

/** Fallback label for a model id like "z-ai/glm-4.7-flash" -> "glm-4.7-flash". */
export function shortModelId(modelId: string): string {
  return (modelId.split('/').pop() || modelId).replace(/:.*$/, '');
}

/** Resolve display names, de-duplicated, preserving order. */
export function modelLabels(modelIds: string[], displayNames: Record<string, string>): string[] {
  const out: string[] = [];
  for (const id of modelIds) {
    if (!id) continue;
    // Strip OpenRouter-style "Provider: " prefixes ("Z.ai: GLM 4.7 Flash" -> "GLM 4.7 Flash").
    const label = (displayNames[id] || shortModelId(id)).replace(/^[^:]{1,30}:\s+/, '');
    if (!out.includes(label)) out.push(label);
  }
  return out;
}

export function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd() + '…';
}

/**
 * "A vs B vs C debate: <prompt>" (or "panel" for panels), under DESCRIPTION_MAX chars.
 * Falls back to the prompt alone when there are no models.
 */
export function buildShareDescription(opts: {
  prompt: string;
  models: string[];
  isPanel: boolean;
  hasContent: boolean;
}): string {
  const prompt = (opts.prompt || '').replace(/\s+/g, ' ').trim();
  if (!opts.hasContent || opts.models.length === 0) {
    return truncate(prompt || 'An AI debate on SiliconSoap.', DESCRIPTION_MAX);
  }
  const kind = opts.isPanel ? 'panel' : 'debate';
  let prefix = `${opts.models.slice(0, 4).join(' vs ')} ${kind}: `;
  if (prefix.length > 120) prefix = `${opts.models.length}-model ${kind}: `;
  return truncate(prefix + prompt, DESCRIPTION_MAX);
}
