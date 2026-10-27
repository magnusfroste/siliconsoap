import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { GenerationErrorView } from '@/services/generationErrorService';

interface Props {
  error: GenerationErrorView;
  /** Omitted when retrying is not possible (e.g. partial failure). */
  onRetry?: () => void;
}

export const GenerationErrorCard = ({ error, onRetry }: Props) => (
  <section role="alert" className="rounded-lg border border-destructive/40 bg-card p-5">
    <div className="flex items-start gap-3">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-semibold">{error.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
        {(onRetry || error.action === 'signin') && (
          <div className="mt-4 flex flex-wrap gap-2">
            {error.action === 'signin' && <Button asChild className="min-h-11"><Link to="/auth">Sign in</Link></Button>}
            {onRetry && <Button variant={error.action === 'signin' ? 'outline' : 'default'} className="min-h-11" onClick={onRetry}>Try again</Button>}
          </div>
        )}
      </div>
    </div>
  </section>
);
