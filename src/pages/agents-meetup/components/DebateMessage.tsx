import { useState, useEffect } from 'react';
import { User, ChevronDown } from 'lucide-react';
import { AgentAvatar } from '@/components/labs/agent-card/AgentAvatar';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { QuoteShareButton } from './QuoteShareButton';
import { getAgentLetter } from '../utils/agentNameGenerator';
import { parseAgentResponse } from '../utils/parseAgentResponse';
import { splitParagraphs, splitSentences, type RoundedMsg } from '../utils/debatePresentation';

const useTypewriter = (text: string, enabled: boolean, audioDurationMs?: number | null) => {
  const [displayedText, setDisplayedText] = useState(enabled ? '' : text);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setDisplayedText(text);
      setIsTyping(false);
      return;
    }

    const len = text.length;
    if (len === 0) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    // Don't start typing until we know the audio duration
    // Show empty text while waiting for audio to load
    if (!audioDurationMs || audioDurationMs <= 0) {
      setDisplayedText('');
      setIsTyping(true); // show cursor to indicate loading
      return;
    }

    // Audio duration is known – spread typing across ~90% of it
    setDisplayedText('');
    setIsTyping(true);
    let index = 0;

    const targetDuration = audioDurationMs * 0.9;
    const intervalMs = Math.max(10, targetDuration / len);
    const chunkSize = intervalMs < 10 ? Math.ceil(10 / intervalMs) : 1;
    const adjustedInterval = Math.max(10, intervalMs * chunkSize);

    const interval = setInterval(() => {
      index = Math.min(index + chunkSize, len);
      setDisplayedText(text.slice(0, index));
      if (index >= len) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, adjustedInterval);

    return () => clearInterval(interval);
  }, [text, enabled, audioDurationMs]);

  return { displayedText, isTyping };
};

export function DebateMessage({ entry, index, total, chatUrl, flagged, reasoningOpen, reasoningEnabled = true, isPlaying = false, isTheaterReveal = false, audioDurationMs, userLabel }: { entry: RoundedMsg; index: number; total: number; chatUrl?: string; flagged: Set<string>; reasoningOpen?: boolean; reasoningEnabled?: boolean; isPlaying?: boolean; isTheaterReveal?: boolean; audioDurationMs?: number | null; userLabel?: string }) {
  const { message, isUser, name } = entry;
  const parsed = parseAgentResponse(message.message);
  const [expanded, setExpanded] = useState(false);
  const [privateOpen, setPrivateOpen] = useState(reasoningOpen ?? false);
  useEffect(() => { if (reasoningOpen !== undefined) setPrivateOpen(reasoningOpen); }, [reasoningOpen]);
  const { displayedText, isTyping } = useTypewriter(parsed.publicMessage, isTheaterReveal, audioDurationMs);
  const letter = getAgentLetter(message.agent) as 'A' | 'B' | 'C';
  const long = parsed.publicMessage.length > 600;
  const visible = isTheaterReveal ? displayedText : long && !expanded ? `${parsed.publicMessage.slice(0, 600).trim()}…` : parsed.publicMessage;
  const paragraphs = splitParagraphs(visible);
  const hasFlag = paragraphs.some((paragraph) => splitSentences(paragraph).some((sentence) => flagged.has(sentence.trim())));

  return <article className={`group border-b border-border pb-8 ${isPlaying ? 'rounded-lg ring-2 ring-primary p-3' : ''}`}><div className="flex gap-4">
    {isUser
      ? <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground" aria-hidden="true"><User className="h-5 w-5" /></div>
      : <AgentAvatar agentLetter={letter} name={name} size="md" />}
    <div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline justify-between gap-2"><div><h3 className="font-semibold">{isUser ? userLabel || name : name}</h3>{!isUser && <p className="text-xs text-muted-foreground">{message.persona ? <>{message.persona} · </> : null}<span className="break-all font-mono">{message.model}</span></p>}</div><span className="font-mono text-xs text-muted-foreground">{index + 1}/{total}</span></div>
    <div className="mt-4 space-y-4 text-[17px] leading-[1.65]">{paragraphs.map((paragraph, paragraphIndex) => {
      const sentences = splitSentences(paragraph);
      return <p key={paragraphIndex} className="whitespace-pre-wrap">{sentences.map((sentence, sentenceIndex) => {
        const isFlagged = flagged.has(sentence.trim());
        const text = sentenceIndex < sentences.length - 1 ? `${sentence} ` : sentence;
        return isFlagged
          ? <mark key={sentenceIndex} className="bg-chip-warning-bg text-chip-warning-fg underline decoration-dotted decoration-1 underline-offset-4">{text}</mark>
          : <span key={sentenceIndex}>{text}</span>;
      })}</p>;
    })}</div>
    {isTyping && <span className="inline-block h-4 w-0.5 animate-pulse bg-foreground" />}
    {hasFlag && <p className="mt-2 text-xs font-medium text-chip-warning-fg">Number to check: figure cited without a source link.</p>}
    {long && !isTheaterReveal && <Button type="button" variant="link" className="h-auto p-0" onClick={() => setExpanded(!expanded)}>{expanded ? 'Show less' : 'Show full answer'}</Button>}
    {parsed.thinking && reasoningEnabled && <Collapsible open={privateOpen} onOpenChange={setPrivateOpen} className="mt-4"><CollapsibleTrigger asChild><Button variant="ghost" size="sm" className="h-auto px-0 text-xs text-muted-foreground"><ChevronDown className="mr-1 h-3 w-3" />Private reasoning</Button></CollapsibleTrigger><CollapsibleContent className="mt-2 border-l-2 border-border whitespace-pre-wrap pl-4 text-sm text-muted-foreground">{parsed.thinking}</CollapsibleContent></Collapsible>}
    <div className="mt-4"><QuoteShareButton message={{ ...message, message: parsed.publicMessage }} chatUrl={chatUrl} /></div></div>
  </div></article>;
}

