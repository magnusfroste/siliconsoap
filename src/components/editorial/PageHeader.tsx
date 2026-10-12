import type { ReactNode } from 'react';
export function PageHeader({ eyebrow, title, lead, action }: { eyebrow: string; title: ReactNode; lead: string; action?: ReactNode }) {
 return <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div className="max-w-3xl min-w-0"><p className="mb-3 text-xs font-semibold uppercase text-primary">{eyebrow}</p><h1 className="font-display text-3xl leading-tight md:text-4xl lg:text-5xl">{title}</h1><p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">{lead}</p></div>{action && <div className="shrink-0">{action}</div>}</header>;
}
