import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { PanelExample } from './PanelExample';
export function AgentLandingSection() {
  const { getNumericValue, isEnabled, loading } = useFeatureFlags();
  const free = !loading && isEnabled('guest_credits_amount') ? getNumericValue('guest_credits_amount') : null;
  return <section className="border-y bg-accent text-foreground"><div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:gap-16 md:px-10 md:py-20"><div><p className="mb-5 text-xs font-semibold uppercase text-primary">New · For your AI assistant</p><h2 className="font-display text-3xl font-semibold leading-tight md:text-5xl">Your assistant can ask the panel too.</h2><p className="mt-5 text-base leading-relaxed text-muted-foreground">Connect SiliconSoap to Claude or ChatGPT. Before it answers something that matters, it gets a second opinion from models in Europe, the US and China — and tells you where they disagree.</p><div className="mt-6 flex flex-wrap items-center gap-4"><Button asChild size="lg" className="rounded-full"><Link to="/connect">Connect your agent</Link></Button>{free !== null && <span className="text-sm text-muted-foreground">{free} free panels · no account needed</span>}</div></div><PanelExample compact /></div></section>;
}
