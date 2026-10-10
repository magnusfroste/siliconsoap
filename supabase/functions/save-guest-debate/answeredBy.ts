const MODEL_ID_RE = /^[a-z0-9._-]+\/[a-z0-9._:-]+$/i;

/** Accept a fallback model id only if it looks like a real OpenRouter id; otherwise null. */
export function sanitizeAnsweredBy(value: unknown): string | null {
  return typeof value === "string" && value.length <= 120 && MODEL_ID_RE.test(value) ? value : null;
}
