// Pure helpers for honest labelling of fallback answers.

export const FALLBACK_TOOLTIP =
  'The requested model returned an error or was rate-limited, so a fallback model answered this turn.';

const KNOWN_NAMES: Record<string, string> = { 'openai/gpt-4o-mini': 'GPT-4o-mini' };

type FallbackCarrier = { answeredByModel?: string | null; answered_by_model?: string | null; model?: string };

/** The model that actually answered, when it differs from the cast model; otherwise null. */
export const answeredByOf = (msg: FallbackCarrier): string | null => {
  const actual = msg.answeredByModel || msg.answered_by_model || null;
  return actual && actual !== msg.model ? actual : null;
};

/** Curated display name without the "Provider: " prefix; known ids; otherwise the raw id. */
export const shortModelName = (modelId: string, names?: Record<string, string>) => {
  const curated = names?.[modelId];
  if (curated) return curated.replace(/^[^:]+:\s*/, '');
  return KNOWN_NAMES[modelId] || modelId;
};

export const fallbackChipLabel = (answeredBy: string, requested: string, names?: Record<string, string>) =>
  `Answered by ${shortModelName(answeredBy, names)} · ${shortModelName(requested, names)} was unavailable`;

/** "2 of 3 turns answered by a fallback model", or null when none were. */
export const fallbackTurnsNote = (messages: FallbackCarrier[], modelId: string) => {
  const turns = messages.filter((m) => m.model === modelId);
  const fallbacks = turns.filter((m) => answeredByOf(m)).length;
  if (!fallbacks) return null;
  return `${fallbacks} of ${turns.length} ${turns.length === 1 ? 'turn' : 'turns'} answered by a fallback model`;
};

/** Row payload for agent_chat_messages inserts (logged-in saves and guest migration). */
export const toMessageInsert = (
  chatId: string,
  msg: { agent: string; message: string; model: string; persona: string; answeredByModel?: string | null; answered_by_model?: string | null; created_at?: string },
) => ({
  chat_id: chatId,
  agent: msg.agent,
  message: msg.message,
  model: msg.model,
  persona: msg.persona,
  answered_by_model: msg.answeredByModel || msg.answered_by_model || null,
  ...(msg.created_at ? { created_at: msg.created_at } : {}),
});
