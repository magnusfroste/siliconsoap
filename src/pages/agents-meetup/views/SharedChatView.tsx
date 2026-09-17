import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, ChevronDown, Copy, Droplets, Lock, RotateCcw, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';
import { useSharedChat } from '../hooks/useSharedChat';
import { ReactionButtons } from '../components/ReactionButtons';
import { RoundSeparator } from '../components/RoundSeparator';
import { QuoteShareButton } from '../components/QuoteShareButton';
import { AgentAvatar } from '@/components/labs/agent-card/AgentAvatar';
import { LicenseChip, OriginChip, SpeedChip } from '@/components/model-chips';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { parseAgentResponse } from '../utils/parseAgentResponse';
import { getAgentLetter, getAgentSoapName } from '../utils/agentNameGenerator';
import { getEnabledModels } from '@/repositories/curatedModelsRepository';
import type { CuratedModel } from '@/models/model';

const BASE_URL = 'https://siliconsoap.com';
const SCHEMA_SCRIPT_ID = 'discussion-forum-schema';
const DEFAULT_TITLE = 'SiliconSoap — See how AI models really reason under pressure';

const settingChip = 'inline-flex min-h-7 items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium';
const NUMBER_RE = /(?:\b\d+(?:[.,]\d+)?\s*%|\$\s*\d+|€\s*\d+|£\s*\d+|\b\d+(?:[.,]\d+)?\s*(?:million|billion|trillion|percent)\b)/i;
const LINK_RE = /https?:\/\//i;

const splitParagraphs = (text: string) => text.split(/\n\s*\n/);
const splitSentences = (text: string) => text.split(/(?<=[.!?])\s+/);

const splitPrompt = (prompt: string) => {
  const match = prompt.match(/\s*\(Note:\s*([^)]*)\)\s*$/i);
  return match ? { question: prompt.slice(0, match.index).trim(), note: match[1].trim() } : { question: prompt, note: '' };
};

const dateLabel = (value?: string) => value ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)) : '';

type SharedMsg = { id?: string; agent: string; persona: string; model: string; message: string; created_at?: string };
type RoundedMsg = { message: SharedMsg; round: number; isUser: boolean; name: string };

/** Rounds are derived by walking messages in created_at order: a new round starts when an
 * agent letter that already spoke in the current round speaks again. User turns stay put. */
const withRounds = (messages: SharedMsg[]): RoundedMsg[] => {
  const ordered = [...messages].sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
  let round = 1;
  let seen = new Set<string>();
  return ordered.map((message) => {
    const isUser = message.agent === 'You';
    if (isUser) return { message, round, isUser, name: 'You (debate creator)' };
    const letter = getAgentLetter(message.agent);
    if (seen.has(letter)) { round += 1; seen = new Set([letter]); } else seen.add(letter);
    return { message, round, isUser, name: getAgentSoapName(message.agent, message.persona) };
  });
};

type Claim = { sentence: string; name: string; round: number };

const numberClaims = (entries: RoundedMsg[]): Claim[] => {
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

const excerpt = (text: string) => text.length > 140 ? `${text.slice(0, 139).trim()}…` : text;

export const SharedChatView = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const { chat, messages, loading, error } = useSharedChat(shareId);
  const tracked = useRef(false);
  const [models, setModels] = useState<CuratedModel[]>([]);
  const [claimsOpen, setClaimsOpen] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches);

  useEffect(() => { getEnabledModels().then(setModels).catch(() => setModels([])); }, []);
  useEffect(() => {
    if (!shareId || tracked.current) return;
    tracked.current = true;
    void supabase.rpc('increment_chat_view_count', { p_share_id: shareId });
  }, [shareId]);

  useEffect(() => {
    if (!chat) return;
    const canonicalUrl = `${BASE_URL}/shared/${shareId}`;
    const description = chat.prompt.length > 160 ? `${chat.prompt.slice(0, 157)}...` : chat.prompt;
    document.title = `${chat.title} | SiliconSoap`;
    updateMetaTag('description', description); updateLinkTag('canonical', canonicalUrl);
    updateMetaTag('og:title', chat.title); updateMetaTag('og:description', description); updateMetaTag('og:url', canonicalUrl); updateMetaTag('og:type', 'article'); updateMetaTag('og:image', getOgImageUrl(shareId || ''));
    updateMetaTag('twitter:title', chat.title); updateMetaTag('twitter:description', description); updateMetaTag('twitter:image', getOgImageUrl(shareId || ''));
    updateDiscussionSchema(chat, messages, shareId || '');
    return () => { document.title = DEFAULT_TITLE; updateLinkTag('canonical', `${BASE_URL}/`); updateMetaTag('og:type', 'website'); removeDiscussionSchema(); };
  }, [chat, messages, shareId]);

  const rounded = useMemo(() => withRounds(messages as SharedMsg[]), [messages]);
  const claims = useMemo(() => numberClaims(rounded), [rounded]);
  const flaggedSentences = useMemo(() => new Set(claims.map((claim) => claim.sentence)), [claims]);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" /></div>;
  if (error || !chat) {
    const config = error === 'deleted' ? [Trash2, 'Debate removed', 'This debate has been deleted by its owner.'] : error === 'not_public' ? [Lock, 'Private debate', 'This debate is not public.'] : [Droplets, 'Debate not found', 'This link appears to be invalid.'];
    const Icon = config[0] as typeof Droplets;
    return <main className="flex min-h-screen items-center justify-center p-6 text-center"><div className="max-w-md space-y-4"><Icon className="mx-auto h-10 w-10 text-muted-foreground" /><h1 className="font-display text-3xl font-semibold">{String(config[1])}</h1><p className="text-muted-foreground">{String(config[2])}</p><Button onClick={() => navigate('/')}>Go home</Button></div></main>;
  }

  const { question, note } = splitPrompt(chat.prompt);
  const settings = chat.settings;
  const agents = Math.min(3, Math.max(1, settings.numberOfAgents || 2));
  const rounds = Math.max(1, settings.rounds || 1);
  const bias = settings.agreementBias ?? 50;
  const biasLabel = bias < 30 ? "Devil's advocate" : bias > 70 ? 'Agreeable' : 'Balanced';
  const tone = settings.conversationTone || 'collaborative';
  const length = settings.responseLength === 'short' ? 'Brief answers' : settings.responseLength === 'long' ? 'Detailed answers' : 'Medium-length answers';
  const order = settings.turnOrder === 'random' ? 'Random turns' : settings.turnOrder === 'popcorn' ? 'Popcorn turns' : 'Turns in fixed order';
  const chips = [`${tone[0].toUpperCase()}${tone.slice(1)} tone`, ...(bias !== 50 ? [`${biasLabel} · bias ${bias}`] : []), ...(settings.personalityIntensity !== 'moderate' && settings.personalityIntensity ? [settings.personalityIntensity === 'extreme' ? 'Dramatic personas' : 'Subtle personas'] : []), length, order];
  const modelIds = [settings.models.agentA, settings.models.agentB, settings.models.agentC].slice(0, agents);
  const personas = [settings.personas.agentA, settings.personas.agentB, settings.personas.agentC];
  const rerun = `/new?prompt=${encodeURIComponent(chat.prompt)}`;
  const shareUrl = window.location.href;
  const productionUrl = shareId ? `${BASE_URL}/shared/${shareId}` : shareUrl;
  const totalRounds = rounded.length ? Math.max(rounds, rounded[rounded.length - 1].round) : rounds;
  const groups = rounded.reduce<{ round: number; items: RoundedMsg[] }[]>((acc, entry) => {
    const last = acc[acc.length - 1];
    if (last && last.round === entry.round) last.items.push(entry); else acc.push({ round: entry.round, items: [entry] });
    return acc;
  }, []);

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(productionUrl); toast.success('Link copied'); }
    catch { toast.error('Could not copy the link'); }
  };
  const openShare = (url: string) => window.open(url, '_blank', 'width=600,height=600,noopener,noreferrer');

  return <div className="min-h-screen bg-background pb-20 md:pb-0">
    <header className="border-b bg-background/95 backdrop-blur"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8"><Link to="/" className="font-display text-2xl font-semibold">SiliconSoap</Link><nav className="hidden items-center gap-7 text-sm md:flex"><Link to="/explore">Explore debates</Link><Link to="/models">Models</Link><Link to="/learn">Learn</Link></nav><Button asChild><Link to="/new">Start a debate</Link></Button></div></header>

    <main>
      <section className="border-b"><div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:px-8 lg:grid-cols-12 lg:py-16"><div className="lg:col-span-8"><div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground"><span className={settingChip}>Public debate</span><span>{dateLabel(chat.created_at)}</span><span>·</span><span>{agents} agents · {rounds} rounds</span></div><h1 className="max-w-4xl font-display text-4xl font-semibold leading-tight md:text-6xl">{question}</h1>{note && <p className="mt-4 text-muted-foreground"><strong className="text-foreground">Setup note:</strong> {note}</p>}<div className="mt-6 flex flex-wrap gap-2">{chips.map((chip, index) => <span key={chip} className={`${settingChip} ${index > 2 ? 'hidden sm:inline-flex' : ''}`}>{chip}</span>)}</div></div>
      <aside className="rounded-lg bg-foreground p-5 text-background lg:col-span-4"><p className="font-display text-2xl font-semibold">Run this question your way</p><p className="mt-2 text-sm text-background/70">Keep the question, change the cast and rules.</p><Button asChild variant="secondary" size="lg" className="mt-5 w-full"><Link to={rerun}>Rerun with your own cast<ArrowRight className="ml-2 h-4 w-4" /></Link></Button><div className="mt-4 flex gap-2">
        <Button variant="secondary" size="icon" className="h-11 w-11" aria-label="Copy debate link" onClick={copyLink}><Copy className="h-4 w-4" /></Button>
        <Button variant="secondary" size="icon" className="h-11 w-11" aria-label="Share this debate on X" onClick={() => openShare(`https://twitter.com/intent/tweet?url=${encodeURIComponent(productionUrl)}&text=${encodeURIComponent(chat.title)}%20via%20%40SiliconSoap`)}><svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg></Button>
        <Button variant="secondary" size="icon" className="h-11 w-11" aria-label="Share this debate on LinkedIn" onClick={() => openShare(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(productionUrl)}`)}><svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zm1.782 13.019H3.555V9h3.564v11.452z" /></svg></Button>
      </div></aside></div></section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 md:px-8 lg:grid-cols-12">
        <section className="order-3 min-w-0 lg:order-1 lg:col-span-8"><h2 className="mb-7 font-display text-3xl font-semibold">The debate</h2><div className="space-y-10">{groups.map(({ round, items }, groupIndex) => <div key={round} className="space-y-6">{groupIndex > 0 && <RoundSeparator roundNumber={round} totalConfiguredRounds={totalRounds} isFinalRound={round === totalRounds} />}{items.map((entry, itemIndex) => <SharedMessage key={entry.message.id || `${round}-${itemIndex}`} entry={entry} total={rounded.length} index={rounded.indexOf(entry)} chatUrl={shareUrl} flagged={flaggedSentences} />)}</div>)}</div></section>
        <aside className="order-1 space-y-5 lg:order-2 lg:col-span-4">
          <section className="rounded-lg border bg-card p-5"><h2 className="font-display text-2xl font-semibold">The cast</h2><div className="mt-5 space-y-5">{modelIds.map((modelId, index) => { const model = models.find((item) => item.model_id === modelId); const letter = String.fromCharCode(65 + index) as 'A' | 'B' | 'C'; const name = getAgentSoapName(`Agent ${letter}`, personas[index]); return <div key={modelId} className="flex gap-3"><AgentAvatar agentLetter={letter} name={name} size="md" /><div className="min-w-0"><p className="font-medium">{name}</p><p className="truncate font-mono text-xs text-muted-foreground">{model?.display_name || modelId}</p><div className="mt-2 flex flex-wrap gap-1"><LicenseChip license={model?.license_type} /><OriginChip origin={model?.origin_region} compact /><SpeedChip speed={model?.speed_rating} /></div></div></div>; })}</div><Button asChild variant="outline" className="mt-5 w-full"><Link to={rerun}>Rerun this cast</Link></Button></section>
          {claims.length > 0 && <Collapsible open={claimsOpen} onOpenChange={setClaimsOpen} className="rounded-lg border bg-chip-warning-bg p-5"><CollapsibleTrigger className="flex w-full items-center justify-between gap-2 text-left font-medium text-chip-warning-fg"><span className="flex items-center gap-2">Numbers to check <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-chip-warning-fg/30 px-1.5 text-xs">{claims.length}</span></span><ChevronDown className="h-4 w-4" /></CollapsibleTrigger><CollapsibleContent className="pt-4"><p className="mb-3 text-xs text-chip-warning-fg">These claims contain figures but no visible source link. Verify before sharing.</p><ol className="space-y-3 text-sm text-chip-warning-fg">{claims.map((claim) => <li key={claim.sentence} className="border-t border-chip-warning-fg/20 pt-2"><p>“{excerpt(claim.sentence)}”</p><p className="mt-1 text-xs text-chip-warning-fg/80">{claim.name} · Round {claim.round}</p></li>)}</ol></CollapsibleContent></Collapsible>}
          {shareId && <section className="rounded-lg border bg-card p-5"><h2 className="font-display text-xl font-semibold">React to this debate</h2><div className="mt-4"><ReactionButtons shareId={shareId} /></div></section>}
        </aside>
      </div>
    </main>

    <section className="bg-foreground text-background"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-12 md:flex-row md:items-center md:px-8"><div><p className="font-display text-3xl font-semibold">Try a fresh fast-model cast</p><p className="mt-2 text-background/70">Same hard question, a different set of minds.</p></div><div className="flex gap-3"><Button asChild variant="secondary"><Link to={rerun}>Start from this question</Link></Button><Button asChild variant="outline" className="border-background/30 bg-transparent text-background hover:bg-background/10 hover:text-background"><Link to="/explore">Explore debates</Link></Button></div></div></section>
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur md:hidden"><Button asChild size="lg" className="w-full"><Link to={rerun}><RotateCcw className="mr-2 h-4 w-4" />Rerun this question</Link></Button></div>
  </div>;
};

function SharedMessage({ entry, index, total, chatUrl, flagged }: { entry: RoundedMsg; index: number; total: number; chatUrl: string; flagged: Set<string> }) {
  const { message, isUser, name } = entry;
  const parsed = parseAgentResponse(message.message);
  const [expanded, setExpanded] = useState(false);
  const letter = getAgentLetter(message.agent) as 'A' | 'B' | 'C';
  const long = parsed.publicMessage.length > 600;
  const visible = long && !expanded ? `${parsed.publicMessage.slice(0, 600).trim()}…` : parsed.publicMessage;
  const paragraphs = splitParagraphs(visible);
  const hasFlag = paragraphs.some((paragraph) => splitSentences(paragraph).some((sentence) => flagged.has(sentence.trim())));

  return <article className="group border-b border-border pb-8"><div className="flex gap-4">
    {isUser
      ? <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground" aria-hidden="true"><User className="h-5 w-5" /></div>
      : <AgentAvatar agentLetter={letter} name={name} size="md" />}
    <div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline justify-between gap-2"><div><h3 className="font-semibold">{name}</h3>{!isUser && <p className="text-xs text-muted-foreground">{message.persona} · <span className="font-mono">{message.model}</span></p>}</div><span className="font-mono text-xs text-muted-foreground">{index + 1}/{total}</span></div>
    <p className="mt-4 whitespace-pre-wrap text-[17px] leading-[1.65]">{sentences.map((sentence, sentenceIndex) => {
      const isFlagged = flagged.has(sentence.trim());
      const text = sentenceIndex < sentences.length - 1 ? `${sentence} ` : sentence;
      return isFlagged
        ? <mark key={sentenceIndex} className="bg-chip-warning-bg text-chip-warning-fg underline decoration-dotted decoration-1 underline-offset-4">{text}</mark>
        : <span key={sentenceIndex}>{text}</span>;
    })}</p>
    {hasFlag && <p className="mt-2 text-xs font-medium text-chip-warning-fg">Number to check: figure cited without a source link.</p>}
    {long && <Button type="button" variant="link" className="h-auto p-0" onClick={() => setExpanded(!expanded)}>{expanded ? 'Show less' : 'Continue reading'}</Button>}
    {parsed.thinking && <Collapsible className="mt-4"><CollapsibleTrigger className="text-xs font-medium text-muted-foreground underline">Private reasoning</CollapsibleTrigger><CollapsibleContent className="mt-2 border-l-2 border-border pl-4 text-sm text-muted-foreground">{parsed.thinking}</CollapsibleContent></Collapsible>}
    <div className="mt-4"><QuoteShareButton message={message} chatUrl={chatUrl} /></div></div>
  </div></article>;
}

const getOgImageUrl = (shareId: string) => `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/og-image?shareId=${shareId}`;
function updateMetaTag(property: string, content: string) { let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null; if (!meta) meta = document.querySelector(`meta[name="${property}"]`) as HTMLMetaElement | null; if (!meta) { meta = document.createElement('meta'); meta.setAttribute(property.startsWith('og:') ? 'property' : 'name', property); document.head.appendChild(meta); } meta.content = content; }
function updateLinkTag(rel: string, href: string) { let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null; if (!link) { link = document.createElement('link'); link.rel = rel; document.head.appendChild(link); } link.href = href; }
function updateDiscussionSchema(chat: { title: string; prompt: string; created_at?: string; updated_at?: string; view_count?: number }, messages: { agent: string; message: string; created_at?: string }[], shareId: string) { removeDiscussionSchema(); const schema = { '@context': 'https://schema.org', '@type': 'DiscussionForumPosting', '@id': `${BASE_URL}/shared/${shareId}`, headline: chat.title, articleBody: chat.prompt, url: `${BASE_URL}/shared/${shareId}`, datePublished: chat.created_at, dateModified: chat.updated_at || chat.created_at, publisher: { '@type': 'Organization', name: 'SiliconSoap', url: BASE_URL }, interactionStatistic: [{ '@type': 'InteractionCounter', interactionType: 'https://schema.org/ViewAction', userInteractionCount: chat.view_count || 0 }, { '@type': 'InteractionCounter', interactionType: 'https://schema.org/CommentAction', userInteractionCount: messages.length }], comment: messages.slice(0, 10).map((msg, index) => ({ '@type': 'Comment', position: index + 1, author: { '@type': 'Person', name: msg.agent }, text: msg.message.slice(0, 500), dateCreated: msg.created_at })), commentCount: messages.length }; const script = document.createElement('script'); script.id = SCHEMA_SCRIPT_ID; script.type = 'application/ld+json'; script.textContent = JSON.stringify(schema); document.head.appendChild(script); }
function removeDiscussionSchema() { document.getElementById(SCHEMA_SCRIPT_ID)?.remove(); }
