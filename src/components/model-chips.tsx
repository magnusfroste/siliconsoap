import { cn } from '@/lib/utils';

const base = 'inline-flex min-h-5 items-center rounded-full px-2 py-0.5 text-xs font-medium';

export const originNames = { US: 'United States', CN: 'China', EU: 'European Union', OTHER: 'Other' } as const;

export function LicenseChip({ license, className }: { license?: string | null; className?: string }) {
  const open = license === 'open-weight';
  return <span className={cn(base, open ? 'bg-chip-open-bg text-chip-open-fg' : 'bg-chip-closed-bg text-chip-closed-fg', className)}>{open ? 'Open weights' : 'Closed'}</span>;
}

export function OriginChip({ origin, compact = false, className }: { origin?: string | null; compact?: boolean; className?: string }) {
  if (!origin || !(origin in originNames)) return null;
  const label = compact ? origin : originNames[origin as keyof typeof originNames];
  return <span className={cn(base, 'border border-border bg-card text-card-foreground', className)}>{label}</span>;
}

export function SpeedChip({ speed, className }: { speed?: string | null; className?: string }) {
  if (!speed) return null;
  const normalized = speed.toLowerCase();
  const style = normalized === 'fast' ? 'bg-chip-fast-bg text-chip-fast-fg' : normalized === 'slow' ? 'bg-chip-slow-bg text-chip-slow-fg' : 'bg-chip-medium-bg text-chip-medium-fg';
  return <span className={cn(base, style, className)}>{normalized === 'medium' ? 'Medium speed' : `${normalized[0]?.toUpperCase()}${normalized.slice(1)}`}</span>;
}