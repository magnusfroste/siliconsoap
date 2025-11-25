import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AnalysisFloatingButtonProps {
  onClick: () => void;
  score?: string;
  isAnalyzing?: boolean;
}

export const AnalysisFloatingButton = ({ 
  onClick, 
  score, 
  isAnalyzing 
}: AnalysisFloatingButtonProps) => {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all animate-pulse hover:animate-none z-50"
      title="Analyze Conversation"
      disabled={isAnalyzing}
    >
      <div className="relative">
        <Sparkles className="h-6 w-6" />
        {score && (
          <Badge 
            variant="secondary" 
            className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs font-bold"
          >
            {score}
          </Badge>
        )}
      </div>
    </Button>
  );
};
