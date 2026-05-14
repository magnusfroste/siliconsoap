// Parses agent responses that may contain a private <thinking>...</thinking>
// scratchpad section (Hermes / Nous-style inner monologue).
//
// Returns { thinking, publicMessage } so the UI can decide whether to reveal
// the agent's private reasoning. The full original response is preserved as
// `raw` for debugging / sharing transparency.

export interface ParsedAgentResponse {
  thinking: string | null;
  publicMessage: string;
  raw: string;
}

const THINKING_REGEX = /<thinking>([\s\S]*?)<\/thinking>/i;

export const parseAgentResponse = (response: string): ParsedAgentResponse => {
  if (!response || typeof response !== 'string') {
    return { thinking: null, publicMessage: response || '', raw: response || '' };
  }

  const match = response.match(THINKING_REGEX);
  if (!match) {
    return { thinking: null, publicMessage: response.trim(), raw: response };
  }

  const thinking = match[1].trim();
  const publicMessage = response.replace(THINKING_REGEX, '').trim();

  // Defensive: if the model only produced thinking and nothing else,
  // surface the thinking as the public message so the UI doesn't go blank.
  if (!publicMessage) {
    return { thinking: null, publicMessage: thinking, raw: response };
  }

  return { thinking, publicMessage, raw: response };
};
