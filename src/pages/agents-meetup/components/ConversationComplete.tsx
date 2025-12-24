import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageCircle, Sparkles, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ConversationCompleteProps {
  totalRounds: number;
  participationMode: 'spectator' | 'jump-in' | 'round-by-round';
  onContinue?: () => void;
  canContinue?: boolean;
  isGuest?: boolean;
}

export const ConversationComplete = ({ 
  totalRounds, 
  participationMode,
  onContinue,
  canContinue = true,
  isGuest = false
}: ConversationCompleteProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
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

      {/* Guest signup nudge */}
      {isGuest && (
        <Card className="mx-auto max-w-md px-4 py-3 bg-gradient-to-r from-primary/5 via-primary/10 to-accent/5 border-primary/20">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-primary/10 shrink-0">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                Enjoyed this debate?
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Sign up to save your conversations, share them publicly, and get more credits.
              </p>
              <Button 
                size="sm" 
                className="mt-2 h-7 text-xs gap-1.5"
                onClick={() => navigate('/auth')}
              >
                <UserPlus className="h-3 w-3" />
                Create free account
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
