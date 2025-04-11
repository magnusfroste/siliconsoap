import React from 'react';
import { Button } from '@/components/ui/button';
import { ModelSelector } from '../../agent-card/ModelSelector';

interface AnalyzerSelectorProps {
  analyzerModel: string;
  setAnalyzerModel: (model: string) => void;
  modelsByProvider: Record<string, any[]>;
  isAnalyzing: boolean;
  handleAnalyzeConversation?: (model?: string) => void;
  isLoading?: boolean;
}

export const AnalyzerSelector: React.FC<AnalyzerSelectorProps> = ({ 
  analyzerModel, 
  setAnalyzerModel, 
  modelsByProvider, 
  isAnalyzing,
  handleAnalyzeConversation,
  isLoading
}) => {
  if (!handleAnalyzeConversation) {
    return (
      <ModelSelector
        agentModel={analyzerModel}
        setAgentModel={setAnalyzerModel}
        modelsByProvider={modelsByProvider}
        loadingModels={false}
        isDisabled={isAnalyzing}
      />
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md mb-6">
        <ModelSelector
          agentModel={analyzerModel}
          setAgentModel={setAnalyzerModel}
          modelsByProvider={modelsByProvider}
          loadingModels={false}
          isDisabled={false}
        />
        <p className="text-xs text-gray-500 mt-2">
          Choose the AI model that will analyze your conversation.
        </p>
      </div>
      <p className="text-gray-600 mb-6">
        Click the button below to analyze the conversation between the AI agents. This will evaluate the quality, insights, and coverage of the discussion.
      </p>
      <Button 
        onClick={() => handleAnalyzeConversation()} 
        className="bg-purple-600 hover:bg-purple-700"
        disabled={isLoading || !analyzerModel}
      >
        Analyze Conversation
      </Button>
    </div>
  );
};
