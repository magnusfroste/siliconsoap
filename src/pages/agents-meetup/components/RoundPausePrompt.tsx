import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';

interface RoundPausePromptProps {
  roundNumber: number;
  onSkip: () => void;
  children?: ReactNode;
}

export const RoundPausePrompt = ({ roundNumber, onSkip, children }: RoundPausePromptProps) => {
  return (
    <Card className="rounded-lg border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-xl font-semibold">Round {roundNumber} done — your turn</p>
        </div>
        <Button
          onClick={onSkip}
          variant="outline"
          size="sm"
          className="ml-4"
        >
          Skip to round {roundNumber + 1}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      {children}
    </Card>
  );
};
