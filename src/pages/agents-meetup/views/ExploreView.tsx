import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, ChevronDown, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { LicenseChip, OriginChip } from '@/components/model-chips';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useExplore } from '@/hooks/useExplore';
import type { CuratedModel } from '@/models/model';
import { debateQuestion, shortModelName, showdownQuote, type ExploreDebate } from '@/services/exploreService';
import { resolveCast } from '../utils/debatePresentation';

const dateLabel = (value: string | null) => value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';
function CastModels({ debate, models }: { debate: ExploreDebate; models: CuratedModel[] }) {
  const cast = resolveCast(debate.settings, debate.transcript);
  return <div className="space-y-2">{(['agentA', 'agentB', 'agentC'] as const).slice(0, cast.numberOfAgents).map(key => {
    const id = cast.models[key];
    const model = models.find(m => m.model_id === id && m.is_enabled);
    return <div key={key} className="flex flex-wrap items-center gap-1.5 text-xs">
      <span className={model ? 'font-semibold' : 'font-mono break-all text-muted-foreground'}>{model ? shortModelName(model.display_name) : id || 'Unknown model'}</span>
      {model ? <><LicenseChip license={model.license_type} /><OriginChip origin={model.origin_region} compact /></> : <span className="rounded-full border border-dashed border-border px-2 py-0.5 text-xs text-muted-foreground">No longer offered</span>}
    </div>;
  })}</div>;
}
function DebateCard({ debate, models }: { debate: ExploreDebate; models: CuratedModel[] }) {
  const cast = resolveCast(debate.settings, debate.transcript);
  return <Link to={`/shared/${debate.share_id}`} className="group flex min-w-0 flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
    <div className="mb-4 flex min-h-6 items-start justify-between gap-2">
      <div className="flex flex-wrap gap-1.5">{debate.featured_at && <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">Showdown</span>}{debate.settings?.analysisResults && <span className="rounded-full bg-chip-warning-bg px-2 py-0.5 text-xs text-chip-warning-fg">Judge's verdict</span>}</div>
      <time className="shrink-0 text-xs text-muted-foreground" dateTime={debate.created_at || undefined}>{dateLabel(debate.created_at)}</time>
    </div>
    <h2 className="mb-4 line-clamp-3 font-display text-xl font-semibold leading-snug">{debateQuestion(debate)}</h2>
    <CastModels debate={debate} models={models} />
    <div className="mt-auto pt-5"><div className="flex items-center justify-between border-t border-border pt-3 text-xs"><span className="text-muted-foreground">{cast.numberOfAgents} agents · {debate.settings?.rounds || 1} rounds</span><span className="flex items-center gap-1 font-semibold text-primary">Read <ArrowRight className="h-3.5 w-3.5" /></span></div></div>
  </Link>;
}
function CardSkeleton() {
  return <div className="min-h-64 animate-pulse rounded-lg border border-border bg-card p-5" aria-label="Loading debate"><div className="mb-5 h-4 w-20 rounded bg-muted" /><div className="mb-3 h-5 w-full rounded bg-muted" /><div className="mb-6 h-5 w-3/4 rounded bg-muted" />{[1,2,3].map(n => <div key={n} className="mb-3 h-4 w-2/3 rounded bg-muted" />)}<div className="mt-6 h-4 w-1/3 rounded bg-muted" /></div>;
}
export default function ExploreView() {
  const state = useExplore();
  const [modelOpen, setModelOpen] = useState(false);
  const { filters, models, debates } = state;
  usePageMeta({ title: 'Explore AI debates', description: 'Read real debates between AI models from the US, Europe and China. Filter by model, origin and license, then rerun any question with your own cast.', canonicalPath: '/explore' });
  const featured = state.showdowns[0];
  const quote = featured ? showdownQuote(featured) : null;
  const chip = (active: boolean) => `h-11 shrink-0 rounded-full border px-3 text-xs ${active ? 'border-foreground bg-foreground text-background hover:bg-foreground/90 hover:text-background' : 'border-border bg-card text-card-foreground'}`;
  return <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden"><div className="mx-auto max-w-6xl px-4 py-8 md:px-10 md:py-10">
    <header className="mb-8 flex flex-wrap items-end justify-between gap-5">
      <div className="max-w-2xl"><p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">Explore</p><h1 className="font-display text-3xl font-semibold leading-tight md:text-4xl">Real transcripts. Real disagreements.</h1><p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">Public debates between models from the US, Europe and China. Filter by the models you care about, read how they hold up, then rerun any question with your own cast.</p></div>
      <Button asChild className="h-11 rounded-full"><Link to="/new">Start a debate <ArrowRight /></Link></Button>
    </header>
    {featured && <section aria-label="This week's showdown" className="debate-completion mb-8 grid overflow-hidden rounded-lg lg:grid-cols-[minmax(0,1fr)_260px]">
      <div className="min-w-0 p-5 md:p-7"><p className="mb-3 text-xs font-semibold uppercase tracking-wider opacity-70">This week's showdown · {dateLabel(featured.featured_at)}</p><h2 className="mb-5 font-display text-2xl font-semibold leading-tight md:text-3xl">{debateQuestion(featured)}</h2><CastModels debate={featured} models={models} />
        {quote && <blockquote className="completion-tile my-5 rounded-r-lg border-l-2 border-primary p-4"><p className="text-sm leading-relaxed">“{quote.sentence}”</p><footer className="mt-2 text-xs opacity-70">{quote.name} · <span className="break-all font-mono">{quote.model}</span></footer></blockquote>}
        <div className="mt-5 flex flex-wrap gap-2"><Button asChild className="completion-primary h-11 w-full rounded-full md:w-auto"><Link to={`/shared/${featured.share_id}`}>Read the transcript</Link></Button><Button asChild variant="outline" className="completion-outline h-11 w-full rounded-full md:w-auto"><Link to={`/new?prompt=${encodeURIComponent(featured.prompt)}`}>Rerun with your own cast</Link></Button></div>
      </div>
      <aside className="completion-tile flex flex-col gap-3 p-5 md:p-7"><h3 className="mb-1 text-xs font-semibold uppercase tracking-wider opacity-60">Earlier showdowns</h3>{state.showdowns.slice(1).map(d => <Link key={d.id} to={`/shared/${d.share_id}`} className="rounded-lg border border-completion-border p-3 transition-colors hover:underline"><p className="line-clamp-3 font-display text-sm font-semibold">{debateQuestion(d)}</p><p className="mt-2 text-xs opacity-60">{dateLabel(d.featured_at)}</p></Link>)}<Button variant="link" className="completion-link mt-auto h-11 justify-start px-0" onClick={() => state.updateFilter('tab','showdowns')}>All showdowns <ArrowRight /></Button></aside>
    </section>}
    <section aria-label="Filter debates" className="mb-6 flex flex-col gap-3">
      <div className="relative md:ml-auto md:w-80"><Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><Input aria-label="Search questions" placeholder="Search questions" value={state.search} onChange={e => state.setSearch(e.target.value)} className="h-11 bg-card pl-9" /></div>
      <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-2" aria-label="Debate filters">
        <div className="mr-2 flex shrink-0 gap-1 rounded-full bg-muted p-1" role="group" aria-label="Debate order">{['newest','showdowns'].map(tab => <Button key={tab} variant="ghost" className={chip(filters.tab === tab)} aria-pressed={filters.tab === tab} onClick={() => state.updateFilter('tab',tab)}>{tab === 'newest' ? 'Newest' : 'Showdowns'}</Button>)}</div>
        <span className="text-xs text-muted-foreground">Origin</span>{[['EU','European Union'],['US','United States'],['CN','China']].map(([value,label]) => <Button key={value} variant="outline" className={chip(filters.origin === value)} aria-pressed={filters.origin === value} onClick={() => state.updateFilter('origin',filters.origin === value ? '' : value)}>{label}</Button>)}
        <span className="ml-2 text-xs text-muted-foreground">License</span>{[['open','Open weights'],['closed','Closed']].map(([value,label]) => <Button key={value} variant="outline" className={chip(filters.license === value)} aria-pressed={filters.license === value} onClick={() => state.updateFilter('license',filters.license === value ? '' : value)}>{label}</Button>)}
        <Popover open={modelOpen} onOpenChange={setModelOpen}><PopoverTrigger asChild><Button variant="outline" role="combobox" aria-expanded={modelOpen} aria-label="Filter by model" className={`${chip(!!filters.model)} max-w-64`}><span className="truncate">{shortModelName(models.find(m => m.model_id === filters.model)?.display_name || filters.model || 'Any model')}</span><ChevronDown /></Button></PopoverTrigger><PopoverContent className="w-80 max-w-[calc(100vw-32px)] p-0" align="end"><Command><CommandInput placeholder="Search models" /><CommandList><CommandEmpty>No models found.</CommandEmpty><CommandItem className="min-h-11" onSelect={() => { state.updateFilter('model',''); setModelOpen(false); }}>Any model</CommandItem>{models.filter(m => m.is_enabled).map(m => <CommandItem key={m.model_id} value={`${m.display_name} ${m.model_id}`} className="min-h-11" onSelect={() => { state.updateFilter('model',m.model_id); setModelOpen(false); }}><span>{shortModelName(m.display_name)}</span>{filters.model === m.model_id && <Check className="ml-auto h-4 w-4" />}</CommandItem>)}</CommandList></Command></PopoverContent></Popover>
      </div>
    </section>
    {state.error ? <div className="py-12 text-center" role="alert"><h2 className="font-display text-2xl">Couldn't load these debates.</h2><Button variant="outline" className="mt-4 h-11 rounded-full" onClick={state.retry}>Try again</Button></div> : state.loading ? <div className="grid gap-4 md:grid-cols-2" role="status" aria-label="Loading debates">{[1,2,3,4].map(n => <CardSkeleton key={n} />)}</div> : <>
      <div className="grid gap-4 md:grid-cols-2">{debates.map(d => <DebateCard key={d.id} debate={d} models={models} />)}</div>
      {!debates.length && <div className="py-12 text-center"><h2 className="font-display text-2xl">No debates match these filters</h2><div className="mt-5 flex flex-wrap justify-center gap-3"><Button variant="outline" className="h-11 rounded-full" onClick={state.clearFilters}>Clear filters</Button><Button asChild className="h-11 rounded-full"><Link to="/new">Start a debate</Link></Button></div></div>}
      {state.hasMore && <div className="mt-8 flex justify-center"><Button variant="outline" className="h-11 w-full rounded-full bg-card md:w-auto" disabled={state.loadingMore} onClick={state.loadMore}>{state.loadingMore && <Loader2 className="animate-spin" />}Load more debates</Button></div>}
    </>}
    <section className="mt-8 flex flex-wrap items-center justify-between gap-5 rounded-lg border border-primary/15 bg-accent p-5 md:p-7"><div className="max-w-2xl"><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">Second opinion for your agent</p><h2 className="font-display text-2xl font-semibold leading-tight">Let Claude or ChatGPT ask a panel before it answers you.</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Connect SiliconSoap to your own assistant. It sends the question, models from different labs argue it out, and your assistant gets back where they agree, where they don't, and which numbers nobody sourced.</p></div><Button asChild className="h-11 w-full rounded-full bg-foreground text-background hover:bg-foreground/90 md:w-auto"><Link to="/api-docs">Connect your agent</Link></Button></section>
    {!state.loading && !state.error && debates.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context':'https://schema.org', '@type':'ItemList', name:'SiliconSoap AI Debates', numberOfItems:debates.length, itemListElement:debates.map((d,i) => ({ '@type':'ListItem', position:i+1, item:{ '@type':'DiscussionForumPosting', headline:debateQuestion(d), text:d.prompt, url:`https://siliconsoap.com/shared/${d.share_id}`, datePublished:d.created_at, author:{ '@type':'Organization', name:'SiliconSoap' }, interactionStatistic:[{ '@type':'InteractionCounter', interactionType:'https://schema.org/CommentAction', userInteractionCount:d.agent_chat_messages[0]?.count || 0 }] } })) }).replace(/</g,'\\u003c') }} />}
  </div></div>;
}
