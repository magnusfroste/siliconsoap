import { toast } from '@/hooks/use-toast';
import { ConversationMessage } from '../../types';
import { useAnalysisState } from './analysis/useAnalysisState';
import { analyzeConversation } from './analysis/analyzerService';

export const useConversationAnalysis = (
  savedApiKey: string, 
  conversation: ConversationMessage[]
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
    // Check for API key in localStorage as fallback
    const storedApiKey = localStorage.getItem('userOpenRouterApiKey');
    const effectiveApiKey = savedApiKey || storedApiKey || '';
    
    console.log("Analysis API Key Debug:", {
      savedApiKey: savedApiKey ? `${savedApiKey.substring(0, 8)}...` : null,
      storedApiKey: storedApiKey ? `${storedApiKey.substring(0, 8)}...` : null,
      effectiveApiKey: effectiveApiKey ? `${effectiveApiKey.substring(0, 8)}...` : null
    });

    // Only show toast if we truly have no API key available
    if (!effectiveApiKey) {
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
        effectiveApiKey,
        prompt,
        'long'
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
