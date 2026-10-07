import { getAgentLetter, getAgentSoapName } from './agentNameGenerator';
import { parseAgentResponse } from './parseAgentResponse';
const NUMBER_RE = /(?:\b\d+(?:[.,]\d+)?\s*%|\$\s*\d+|€\s*\d+|£\s*\d+|\b\d+(?:[.,]\d+)?\s*(?:million|billion|trillion|percent)\b)/i;
const LINK_RE = /https?:\/\//i;

export const splitParagraphs = (text: string) => text.split(/\n\s*\n/);
export const splitSentences = (text: string) => text.split(/(?<=[.!?])\s+/);

export type SharedMsg = { id?: string; agent: string; persona: string; model: string; message: string; created_at?: string; isHuman?: boolean };
export type RoundedMsg = { message: SharedMsg; round: number; isUser: boolean; name: string };

/** Rounds are derived by walking messages in created_at order: a new round starts when an
 * agent letter that already spoke in the current round speaks again. User turns stay put. */
export const withRounds = (messages: SharedMsg[]): RoundedMsg[] => {
  const ordered = [...messages].sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
  let round = 1;
  let seen = new Set<string>();
  return ordered.map((message) => {
    const isUser = message.agent === 'You' || message.isHuman === true;
    if (isUser) return { message, round, isUser, name: 'You (debate creator)' };
    const letter = getAgentLetter(message.agent);
    if (seen.has(letter)) { round += 1; seen = new Set([letter]); } else seen.add(letter);
    return { message, round, isUser, name: getAgentSoapName(message.agent, message.persona) };
  });
};

type Claim = { sentence: string; name: string; round: number };

export const numberClaims = (entries: RoundedMsg[]): Claim[] => {
  const found: Claim[] = [];
  const seen = new Set<string>();
  entries.forEach(({ message, round, name }) => {
    const publicText = parseAgentResponse(message.message).publicMessage;
    if (LINK_RE.test(publicText)) return;
    splitParagraphs(publicText).forEach((paragraph) => {
      splitSentences(paragraph).forEach((raw) => {
        const sentence = raw.trim();
        if (!sentence || seen.has(sentence) || !NUMBER_RE.test(sentence)) return;
        seen.add(sentence);
        found.push({ sentence, name, round });
      });
    });
  });
  return found.slice(0, 6);
};

