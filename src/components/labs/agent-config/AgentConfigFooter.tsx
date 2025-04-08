
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
  // Helper function to stop any ongoing speech synthesis before navigation
  const stopSpeech = () => {
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch (error) {
      console.error("Error stopping speech in footer:", error);
    }
  };

  return (
    <div className="flex w-full justify-between items-center border-t border-gray-200 pt-4 mt-2">
      <div className="flex-none">
        <Button 
          onClick={() => {
            stopSpeech();
            goToStep(1);
          }}
          variant="outline"
        >
          Back
        </Button>
      </div>
      <div className="flex-none ml-auto">
        <Button 
          onClick={() => {
            stopSpeech();
            handleStartConversation();
          }} 
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
