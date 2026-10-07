import { MessageCircle, CheckCircle } from 'lucide-react';

interface RoundSeparatorProps {
  roundNumber: number;
  totalConfiguredRounds?: number;
  isFinalRound?: boolean;
}

export const RoundSeparator = ({ roundNumber, totalConfiguredRounds, isFinalRound }: RoundSeparatorProps) => {
  const isFollowUp = totalConfiguredRounds && roundNumber > totalConfiguredRounds;
  const followUpNumber = isFollowUp ? roundNumber - totalConfiguredRounds : 0;
  
  return (
    <div className="relative my-2 flex items-center gap-4 py-4">
      
      <div className="relative flex shrink-0 items-center gap-2 bg-background">
        {isFinalRound ? (
          <CheckCircle className="h-3.5 w-3.5 text-primary" />
        ) : (
          <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
        )}
        <span className="text-xs font-medium text-muted-foreground">
          {isFollowUp 
            ? `Follow-up ${followUpNumber}` 
            : isFinalRound 
              ? `Round ${roundNumber} · Final`
              : `Round ${roundNumber}`
          }
        </span>
      </div>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
};
