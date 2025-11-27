import { MessageCircle } from 'lucide-react';

interface RoundSeparatorProps {
  roundNumber: number;
}

export const RoundSeparator = ({ roundNumber }: RoundSeparatorProps) => {
  return (
    <div className="relative flex items-center justify-center py-6 my-2">
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="relative flex items-center gap-2 px-4 py-1.5 bg-background border rounded-full shadow-sm">
        <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          Round {roundNumber}
        </span>
      </div>
    </div>
  );
};
