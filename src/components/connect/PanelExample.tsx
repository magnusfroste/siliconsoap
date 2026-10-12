import { Link } from 'react-router-dom';
import { LicenseChip, OriginChip } from '@/components/model-chips';

/** Real panel run on 12 Oct 2026 via the agent endpoint; text quoted exactly from /shared/c0e50abb. */
const PANEL_URL = '/shared/c0e50abb';
const QUESTION = 'Should we move our customer database from a US cloud to an EU provider this year?';
const POSITIONS = [
  { name: 'Mistral Medium 3.5', origin: 'EU', note: 'standing in for Mistral Small 4', stance: 'the CLOUD Act poses a real risk for EU companies, and moving to an EU provider can reduce exposure.' },
  { name: 'Nemotron 3 Nano', origin: 'US', stance: 'Moving to an EU provider is advisable to eliminate CLOUD Act risks.' },
  { name: 'GLM 4.7 Flash', origin: 'CN', stance: 'Immediate migration to an EU provider is crucial to avoid existential risks.' },
];

function ModelLine({ name, origin, note }: { name: string; origin: string; note?: string }) {
  return <div className="flex flex-wrap items-center gap-1.5 text-xs"><strong>{name}</strong><LicenseChip license="open-weight" /><OriginChip origin={origin} compact />{note && <span className="opacity-70">({note})</span>}</div>;
}

export function PanelExample({ compact = false }: { compact?: boolean }) {
  return <div>
    <div className="dark debate-completion rounded-lg p-5 md:p-7" aria-label="Real panel output">
      <div className="mb-4 flex justify-between gap-4 text-xs opacity-70"><span>Real panel · 12 Oct 2026</span><span>3 models · 27 s</span></div>
      {compact ? <div className="space-y-4">
        <p className="truncate text-sm font-medium">{QUESTION}</p>
        <div className="space-y-2">{POSITIONS.map((p) => <ModelLine key={p.name} name={p.name} origin={p.origin} />)}</div>
        <p className="text-xs text-chip-warning-fg">⚑ Numbers to check: 2 conflicting cost estimates, no sources</p>
        <Link to={PANEL_URL} className="inline-flex min-h-11 items-center text-sm font-medium underline-offset-4 hover:underline">Read the full panel →</Link>
      </div> : <>
        <p className="completion-tile ml-8 rounded-md p-3 text-sm leading-relaxed">{QUESTION}</p>
        <div className="completion-tile mt-4 space-y-4 rounded-md p-4">
          <p className="text-xs font-medium opacity-70">SILICONSOAP PANEL · 3 MODELS · 2 ROUNDS</p>
          <p className="text-sm leading-relaxed"><strong>Bottom line</strong> <span className="opacity-70">(confidence: medium):</span> Moving your customer database to an EU provider is advisable to mitigate risks associated with the CLOUD Act. However, thorough assessment of provider jurisdiction and costs is essential before making the transition.</p>
          <div className="space-y-3">{POSITIONS.map((p) => <div key={p.name} className="space-y-1"><ModelLine name={p.name} origin={p.origin} note={p.note} /><p className="text-xs leading-relaxed opacity-80">{p.stance}</p></div>)}</div>
          <p className="text-xs leading-relaxed text-chip-warning-fg">⚑ Numbers to check: Nemotron put migration cost at "roughly 5–10% of annual cloud spend"; GLM said migration is "often neutral to zero cost". Neither cited a source.</p>
        </div>
      </>}
    </div>
    {!compact && <Link to={PANEL_URL} className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-4 hover:underline">Read the full panel →</Link>}
  </div>;
}
