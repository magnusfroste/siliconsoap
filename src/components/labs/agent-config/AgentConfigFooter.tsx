
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight } from 'lucide-react';

interface AgentConfigFooterProps {
  goToStep: (step: number) => void;
  handleStartConversation: () => void;
  isLoading: boolean;
  isDisabled: boolean;
}

export const AgentConfigFooter: React.FC<AgentConfigFooterProps> = ({
  goToStep,
  handleStartConversation,
  isLoading,
  isDisabled
}) => {
  return (
    <div className="flex justify-between border-t border-gray-200 pt-4 mt-2">
      <Button 
        onClick={() => goToStep(1)}
        variant="outline"
      >
        Back
      </Button>
      <div className="space-x-3">
        <Button 
          onClick={handleStartConversation} 
          disabled={isDisabled || isLoading}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isLoading ? "Loading..." : "Start Conversation"}
          {isLoading ? (
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="ml-2 h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};
