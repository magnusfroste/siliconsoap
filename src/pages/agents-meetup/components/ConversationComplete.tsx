import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageCircle, Plus, ArrowRight } from 'lucide-react';
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
    <Card className="mx-auto max-w-md p-6 text-center space-y-4 border-dashed">
      <div className="flex items-center justify-center gap-2 text-muted-foreground">
        <MessageCircle className="h-5 w-5" />
        <span className="text-sm font-medium">Conversation Complete</span>
      </div>
      
      <p className="text-sm text-muted-foreground">
        {totalRounds} round{totalRounds !== 1 ? 's' : ''} completed
      </p>

      <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
        {participationMode !== 'spectator' && canContinue && onContinue && (
          <Button 
            variant="default" 
            size="sm" 
            onClick={onContinue}
            className="gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            Continue Chatting
          </Button>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/new')}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New Conversation
        </Button>
      </div>
    </Card>
  );
};
