import { LicenseChip, OriginChip } from '@/components/model-chips';
export function PanelExample({ compact = false }: { compact?: boolean }) {
  return <div className="dark debate-completion rounded-lg p-5 md:p-7" aria-label="Example panel output">
    <div className="mb-4 flex justify-between gap-4 text-xs opacity-70"><span>{compact ? 'SECOND_OPINION · EXAMPLE' : 'Your assistant'}</span><span>Example output</span></div>
    {!compact && <p className="completion-tile ml-8 rounded-md p-3 text-sm leading-relaxed">Should we move our customer database from a US cloud to an EU provider this year? Get a second opinion first.</p>}
    <div className={compact ? 'space-y-4' : 'completion-tile my-4 space-y-4 rounded-md p-4'}>
      {!compact && <p className="text-xs font-medium opacity-70">SILICONSOAP PANEL · 3 MODELS · 19 S</p>}
      <p className="text-sm leading-relaxed"><strong>{compact ? 'Confidence: medium.' : 'Bottom line:'}</strong> {compact ? 'Two of three models agree; the split is about timing, not direction.' : 'Move the most sensitive data first, but don’t rush a full migration this year without an exit plan for the analytics stack.'}</p>
      <div className="space-y-2">{[['Mistral Small 4','EU','Migrate now; sovereignty risk is real'],['Nemotron 3 Nano','US','Phase it; costs are front-loaded'],['GLM 4.7 Flash','CN','Depends on the contracts you hold']].map(([name, origin, stance]) => <div key={name} className="flex flex-wrap items-center gap-1.5 text-xs"><strong>{name}</strong><LicenseChip license="open-weight" /><OriginChip origin={origin} compact />{!compact && <span className="opacity-70">— {stance}</span>}</div>)}</div>
      <p className="text-xs text-chip-warning-fg">⚑ {compact ? 'Numbers to check: 1' : 'One panelist cited a migration-cost figure without a source.'}</p>
    </div>
    {!compact && <p className="completion-tile mr-8 rounded-md p-3 text-sm leading-relaxed">The panel splits on timing but agrees on one thing: start with the customer table. Here’s what I’d do…</p>}
  </div>;
}
