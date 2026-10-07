export function JudgeVerdict({ analysis }: { analysis: string }) {
  // Keep the existing judge output intact; only its presentation changes.
  const sections = analysis.split(/\n(?=#{1,3}\s)/).filter(section => section.trim());
  return <section className="rounded-lg border bg-card p-5" aria-label="The judge's verdict">
    <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2"><h2 className="font-display text-2xl font-semibold">The judge's verdict</h2><span className="text-xs text-muted-foreground">AI-generated · may be wrong</span></div>
    <div className="grid gap-3 sm:grid-cols-2">{sections.map((section, index) => {
      const lines = section.trim().split('\n');
      const heading = lines[0].match(/^#{1,3}\s+(.+)/);
      const warning = /weak|shame|contradict|backstab|diva|pressure/i.test(heading?.[1] || '');
      return <div key={index} className={`min-w-0 rounded-md p-4 ${warning ? 'bg-chip-warning-bg text-chip-warning-fg' : 'bg-muted'}`}>
        {heading && <h3 className="mb-2 text-xs font-semibold uppercase">{heading[1].replace(/\*\*/g, '')}</h3>}
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{(heading ? lines.slice(1).join('\n') : section).replace(/\*\*/g, '')}</p>
      </div>;
    })}</div>
  </section>;
}