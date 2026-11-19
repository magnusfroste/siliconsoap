export const DEFAULT_ORIGIN = "https://siliconsoap.com";
const ALLOWED = new Set(["https://siliconsoap.com", "https://www.siliconsoap.com"]);
const LOVABLE_PREVIEW = /^https:\/\/[a-z0-9-]+\.(lovable\.app|lovableproject\.com)$/;

/** Accept only our own production or Lovable preview origins for Stripe return URLs. */
export function resolveCheckoutOrigin(origin: string | null | undefined): string {
  if (!origin) return DEFAULT_ORIGIN;
  if (ALLOWED.has(origin) || LOVABLE_PREVIEW.test(origin)) return origin;
  return DEFAULT_ORIGIN;
}
