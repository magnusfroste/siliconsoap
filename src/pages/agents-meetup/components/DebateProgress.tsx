import { useEffect, useState } from 'react';
import { AgentAvatar } from '@/components/labs/agent-card/AgentAvatar';
import type { ChatSettings, ChatMessage } from '@/models/chat';
import type { CuratedModel } from '@/models/model';
import { getAgentSoapName } from '../utils/agentNameGenerator';
import { withRounds } from '../utils/debatePresentation';
import { personaDisplayName } from '../utils/personaName';
import { useAgentProfiles } from '@/hooks/useAgentProfiles';

export function useAnsweringClock(agent: string | null, running: boolean) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    setSeconds(0);
    if (!running || !agent) return;
    const start = Date.now();
    const timer = window.setInterval(() => setSeconds(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [agent, running]);
  return seconds;
}

export function getLiveRound(messages: ChatMessage[], settings: ChatSettings) {
  const rounded = withRounds(messages);
  const lastRound = rounded[rounded.length - 1]?.round || 1;
  const spoken = new Set(rounded.filter(entry => entry.round === lastRound && !entry.isUser).map(entry => entry.message.agent));
  const full = spoken.size >= (settings.numberOfAgents || 2);
  return { round: full ? lastRound + 1 : lastRound, spoken: full ? new Set<string>() : spoken };
}

export function DebateProgress({ settings, messages, answeringAgent, seconds, models }: {
  settings: ChatSettings; messages: ChatMessage[]; answeringAgent: string | null; seconds: number; models: CuratedModel[];
}) {
  const { round, spoken } = getLiveRound(messages, settings);
  const answers = messages.filter(message => !message.isHuman && message.agent !== 'You').length;
  const total = Math.max(1, (settings.numberOfAgents || 2) * (settings.rounds || 1));
  return <section className="border-b bg-card px-4 py-3 md:px-8" aria-label="Debate progress">
    <div className="mx-auto flex max-w-5xl flex-col gap-3 xl:flex-row xl:items-center">
      <div className="shrink-0 xl:w-56">
        <p className="flex justify-between gap-2 text-xs font-semibold"><span>Round {Math.min(round, settings.rounds)} of {settings.rounds}</span><span className="text-muted-foreground">{answers} of {total} answers</span></p>
        <progress aria-label="Answers completed" value={Math.min(answers, total)} max={total} className="debate-progress mt-2 block h-1.5 w-full overflow-hidden rounded-full" />
      </div>
      <div className="grid min-w-0 flex-1 grid-cols-3 gap-1.5">
        {(['A', 'B', 'C'] as const).slice(0, settings.numberOfAgents || 2).map(letter => {
          const key = `agent${letter}` as keyof ChatSettings['personas'];
          const agent = `Agent ${letter}`;
          const name = getAgentSoapName(agent, settings.personas?.[key] || '');
          const modelId = settings.models?.[key] || '';
          const model = models.find(item => item.model_id === modelId);
          const active = agent === answeringAgent;
          return <div key={letter} className={`flex min-w-0 items-center gap-1.5 rounded-lg px-2 py-2 ${active ? 'bg-chip-warning-bg text-chip-warning-fg' : 'bg-muted text-foreground'}`}>
            <span className="shrink-0"><AgentAvatar agentLetter={letter} name={name} /></span>
            <div className="min-w-0 text-[10px] md:text-xs"><p className="hidden truncate font-semibold md:block">{name}</p><p className="hidden truncate text-muted-foreground md:block">{model?.display_name || (modelId || '').split('/').pop()} · {model?.origin_region || '—'}</p><p className="font-medium">{active ? `Answering · ${seconds} s` : spoken.has(agent) ? 'Answered' : 'Waiting'}</p></div>
          </div>;
        })}
      </div>
    </div>
  </section>;
}

export function AnsweringMessage({ agent, settings, seconds }: { agent: string; settings: ChatSettings; seconds: number }) {
  const letter = agent.replace('Agent ', '') as 'A' | 'B' | 'C';
  const key = `agent${letter}` as keyof ChatSettings['personas'];
  const persona = settings.personas?.[key] || '';
  const name = getAgentSoapName(agent, persona);
  const { profiles } = useAgentProfiles();
  const personaLabel = personaDisplayName(persona, profiles);
  return <article aria-live="polite" className="flex gap-3 rounded-lg border border-dashed border-chip-warning-fg/40 bg-chip-warning-bg/40 p-4">
    <AgentAvatar agentLetter={letter} name={name} size="md" />
    <div className="min-w-0 flex-1"><h3 className="font-semibold">{name}</h3><p className="break-all text-xs text-muted-foreground">{personaLabel ? `${personaLabel} · ` : ''}<span className="font-mono">{settings.models?.[key] || ''}</span></p><p className="mt-3 text-sm font-medium text-chip-warning-fg">Is answering… {seconds} s</p><div aria-hidden="true" className="mt-3 space-y-2 motion-safe:animate-pulse"><div className="h-2 w-11/12 rounded bg-muted" /><div className="h-2 w-4/5 rounded bg-muted" /><div className="h-2 w-3/5 rounded bg-muted" /></div></div>
  </article>;
}