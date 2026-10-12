import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
export function CtaBand({ title, lead, label, to, secondary }: { title: string; lead?: string; label: string; to: string; secondary?: {label:string;to:string} }) {
 return <section className="debate-completion mt-10 flex flex-col gap-5 rounded-lg p-6 md:flex-row md:items-center md:justify-between md:p-8"><div><h2 className="font-display text-2xl">{title}</h2>{lead && <p className="mt-2 text-sm opacity-80 max-w-xl">{lead}</p>}</div><div className="flex flex-wrap gap-3 shrink-0"><Button className="completion-primary min-h-11" asChild><Link to={to}>{label}</Link></Button>{secondary && <Button variant="outline" className="completion-outline min-h-11" asChild><Link to={secondary.to}>{secondary.label}</Link></Button>}</div></section>;
}
