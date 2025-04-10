
import { toast } from '@/hooks/use-toast';
import { ConversationMessage } from '../../types';
import { useAnalysisState } from './analysis/useAnalysisState';
import { analyzeConversation } from './analysis/analyzerService';

export const useConversationAnalysis = (
  savedApiKey: string, 
  conversation: ConversationMessage[],
  userApiKey?: string
) => {
  // Use the analysis state hook
  const {
    isAnalyzing,
    setIsAnalyzing,
    analysisResults,
    setAnalysisResults,
    analyzerModel,
    setAnalyzerModel
  } = useAnalysisState();

  const handleAnalyzeConversation = async (model?: string, prompt?: string) => {
    if (!savedApiKey && !userApiKey) {
      toast({
        title: "API Key Required",
        description: "Please provide an OpenRouter API key to analyze the conversation.",
        variant: "destructive",
      });
      return;
    }

    const selectedModel = model || analyzerModel;
    
    setIsAnalyzing(true);
    setAnalysisResults('');
    
    try {
      const analysis = await analyzeConversation(
        conversation,
        selectedModel,
        savedApiKey,
        prompt,
        'long',
        userApiKey
      );
      
      setAnalysisResults(analysis);
    } catch (error) {
      console.error("Error analyzing conversation:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to analyze the conversation. Please try again.";
      toast({
        title: "Analysis Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    setIsAnalyzing,
    analysisResults,
    setAnalysisResults,
    analyzerModel,
    setAnalyzerModel,
    handleAnalyzeConversation
  };
};
