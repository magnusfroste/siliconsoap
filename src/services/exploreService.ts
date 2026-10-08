import type { CuratedModel } from '@/models/model';
import { resolveCast, isDebateComplete, withRounds, type AgentNames, type SharedMsg } from '@/pages/agents-meetup/utils/debatePresentation';
import { stripSpeakerLabel } from '@/pages/agents-meetup/utils/speakerLabel';

export type ExploreFilters = { tab: string; origin: string; license: string; model: string; q: string };
export type ExploreSettings = { models?: Record<string, string>; personas?: Record<string, string>; agentNames?: AgentNames; numberOfAgents?: number; rounds?: number; analysisResults?: string };
export type ExploreDebate = { id: string; title: string; prompt: string; share_id: string; created_at: string | null; featured_at: string | null; settings: ExploreSettings | null; agent_chat_messages: { count: number }[]; transcript: SharedMsg[] };
export const PAGE_SIZE = 24;
export const splitPrompt = (prompt: string) => {
  const match = prompt.match(/\s*\(Note:\s*([^)]*)\)\s*$/i);
  return match ? { question: prompt.slice(0, match.index).trim(), note: match[1].trim() } : { question: prompt, note: '' };
};
export const debateQuestion = (debate: ExploreDebate) => /(?:\.\.\.|…)\s*$/.test(debate.title) ? splitPrompt(debate.prompt).question : debate.title || splitPrompt(debate.prompt).question;
export const shortModelName = (name: string) => name.replace(/^[^:]+:\s*/, '');
// Never interpolate PostgREST syntax or LIKE wildcards from a question search.
export const sanitizeQuestionSearch = (query: string) => query.replace(/[(),.[\]{}"'\\%_*]/g, ' ').replace(/\s+/g, ' ').trim();
export const matchingModelIds = (models: CuratedModel[], filters: ExploreFilters) => models.filter(m =>
  (!filters.origin || m.origin_region === filters.origin) &&
  (!filters.license || m.license_type === (filters.license === 'open' ? 'open-weight' : 'closed')) &&
  (!filters.model || m.model_id === filters.model)
).map(m => m.model_id);
export function completeUniqueDebates(debates: ExploreDebate[]) {
  const unique = new Map<string, ExploreDebate>();
  [...debates].sort((a,b) => (b.created_at || '').localeCompare(a.created_at || '')).forEach(d => {
    const cast = resolveCast(d.settings, d.transcript);
    const answers = d.transcript.filter(m => m.agent !== 'You' && !m.isHuman).length;
    if (!isDebateComplete(answers, cast.numberOfAgents, d.settings?.rounds || 1)) return;
    const key = JSON.stringify([d.prompt, cast.models.agentA, cast.models.agentB, cast.models.agentC]);
    if (!unique.has(key)) unique.set(key, d);
  });
  return [...unique.values()];
}
export function showdownQuote(debate: ExploreDebate) {
  const entries = withRounds(debate.transcript, debate.settings?.agentNames).filter(e => !e.isUser);
  const finalRound = Math.max(0, ...entries.map(e => e.round));
  const names = entries.map(e => e.name);
  const candidates = entries.filter(e => e.round === finalRound).flatMap(e => {
    const publicText = e.message.message.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '').replace(/<thinking>[\s\S]*$/i, '');
    const text = stripSpeakerLabel(publicText, names).replace(/\s+/g, ' ').trim();
    return (text.match(/[^.!?]+[.!?](?=\s|$)/g) || []).map(s => s.trim()).filter(s => s.length >= 50 && s.length <= 180).map(sentence => ({ sentence, name: e.name, model: e.message.model, direct: names.some(n => n !== e.name && (sentence.includes(n) || sentence.includes(n.split(' ')[0]))) }));
  });
  return candidates.find(c => c.direct) || candidates[0] || null;
}
