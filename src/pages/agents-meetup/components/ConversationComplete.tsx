import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ConversationCompleteProps {
  totalRounds: number;
  participationMode: 'spectator' | 'jump-in' | 'round-by-round';
  onContinue?: () => void;
  canContinue?: boolean;
}

export const ConversationComplete = ({ 
  totalRounds, 
  participationMode,
  onContinue,
  canContinue = true
}: ConversationCompleteProps) => {
  const navigate = useNavigate();

  return (
    <Card className="mx-auto max-w-fit px-4 py-2 border-dashed">
      <div className="flex items-center gap-3 text-muted-foreground">
        <MessageCircle className="h-4 w-4 shrink-0" />
        <span className="text-xs">{totalRounds} round{totalRounds !== 1 ? 's' : ''} complete</span>
        
        <div className="flex gap-1.5">
          {participationMode !== 'spectator' && canContinue && onContinue && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={onContinue}
              className="h-7 text-xs px-2"
            >
              Continue
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/new')}
            className="h-7 text-xs px-2"
          >
            New
          </Button>
        </div>
      </div>
    </Card>
  );
};
