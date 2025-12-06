
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BarChart2 } from 'lucide-react';
import { CuratedModel } from '@/repositories/curatedModelsRepository';
import { EmptyAnalysis } from './components/EmptyAnalysis';
import { LoadingAnalysis } from './components/LoadingAnalysis';
import { AnalysisResults } from './components/AnalysisResults';
import { AnalyzerSelector } from './components/AnalyzerSelector';
import { ConversationEntry } from '../types';

interface ConversationAnalysisProps {
  conversation: ConversationEntry[];
  isLoading: boolean;
  isAnalyzing: boolean;
  analysisResults: string;
  handleAnalyzeConversation: (model?: string) => void;
  goToStep: (step: number) => void;
  analyzerModel?: string;
  availableModels: CuratedModel[];
  setAnalyzerModel: (model: string) => void;
}

export const ConversationAnalysis: React.FC<ConversationAnalysisProps> = ({
  conversation,
  isLoading,
  isAnalyzing,
  analysisResults,
  handleAnalyzeConversation,
  goToStep,
  analyzerModel,
  availableModels,
  setAnalyzerModel
}) => {
  const modelsByProvider = availableModels.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, any[]>);
  
  if (conversation.length === 0) {
    return <EmptyAnalysis goToStep={goToStep} />;
  }

  return (
    <Card className="mb-12 overflow-hidden border-2 border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-gray-600" />
            Conversation Analysis
          </div>
          
          <div className="flex items-center gap-2">
            {!isAnalyzing && analysisResults && (
              <div className="flex items-center gap-2">
                <AnalyzerSelector
                  analyzerModel={analyzerModel || ''}
                  setAnalyzerModel={setAnalyzerModel}
                  modelsByProvider={modelsByProvider}
                  isAnalyzing={isAnalyzing}
                />
                <Button 
                  onClick={() => handleAnalyzeConversation()} 
                  size="sm"
                  className="h-8"
                  disabled={isAnalyzing || !analyzerModel}
                  variant="outline"
                >
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="1em"
                      height="1em"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3.5 w-3.5 mr-1"
                    >
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                    </svg>
                    Re-analyze
                  </div>
                </Button>
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <div className="px-6">
        <Separator />
      </div>
      <CardContent className="py-6">
        {isAnalyzing ? (
          <LoadingAnalysis analyzerModel={analyzerModel} />
        ) : !analysisResults ? (
          <AnalyzerSelector
            analyzerModel={analyzerModel || ''}
            setAnalyzerModel={setAnalyzerModel}
            modelsByProvider={modelsByProvider}
            isAnalyzing={false}
            handleAnalyzeConversation={handleAnalyzeConversation}
            isLoading={isLoading}
          />
        ) : (
          <AnalysisResults 
            analysisResults={analysisResults} 
            conversation={conversation} 
          />
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Button
          onClick={() => goToStep(3)}
          variant="outline"
          className="mr-auto"
        >
          Back to Conversation
        </Button>
      </CardFooter>
    </Card>
  );
};
