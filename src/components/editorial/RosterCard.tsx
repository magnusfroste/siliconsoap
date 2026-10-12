import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LicenseChip, OriginChip, SpeedChip } from '@/components/model-chips';
import type { CuratedModel } from '@/models/model';
import { contextLabel, isNewModel, priceLabel, shortModelName } from '@/services/rosterService';
export function RosterCard({model:m}:{model:CuratedModel}) {
 return <Card className="flex min-w-0 flex-col rounded-lg p-4 shadow-none"><div className="flex items-start justify-between gap-2"><h3 className="font-display text-lg font-semibold leading-snug">{shortModelName(m.display_name)}</h3><OriginChip origin={m.origin_region} compact /></div><p className="mt-1 font-mono text-xs text-muted-foreground break-all">{m.model_id}</p><div className="mt-3 flex flex-wrap gap-1.5">{isNewModel(m.created_at) && <span className="rounded-full bg-foreground text-background px-2 py-0.5 text-xs">New this week</span>}<LicenseChip license={m.license_type}/><SpeedChip speed={m.speed_rating}/><span className="rounded-full border px-2 py-0.5 text-xs">{priceLabel(m.price_tier)}</span></div><p className="my-4 text-sm leading-relaxed text-muted-foreground">{m.description}</p><footer className="mt-auto border-t pt-2"><p className="text-xs text-muted-foreground">{contextLabel(m.context_window)} context</p><div className="flex flex-wrap justify-between gap-1"><Button asChild variant="link" className="min-h-11 px-0 text-xs"><Link to={`/explore?model=${encodeURIComponent(m.model_id)}`}>Its debates</Link></Button><Button asChild variant="link" className="min-h-11 px-0 text-xs"><Link to={`/new?model=${encodeURIComponent(m.model_id)}`}>Debate it →</Link></Button></div></footer></Card>;
}
