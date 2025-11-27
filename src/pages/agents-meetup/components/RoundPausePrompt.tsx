import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface RoundPausePromptProps {
  roundNumber: number;
  onSkip: () => void;
}

export const RoundPausePrompt = ({ roundNumber, onSkip }: RoundPausePromptProps) => {
  return (
    <Card className="p-6 border-2 border-primary/20 bg-primary/5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Round {roundNumber} Complete</p>
          <p className="text-sm text-muted-foreground mt-1">
            Your turn! Add to the discussion or continue to the next round.
          </p>
        </div>
        <Button
          onClick={onSkip}
          variant="outline"
          size="sm"
          className="ml-4"
        >
          Skip to Round {roundNumber + 1}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
