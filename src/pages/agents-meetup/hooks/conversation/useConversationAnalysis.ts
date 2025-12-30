import React from 'react';
import { toast } from '@/hooks/use-toast';
import { ConversationMessage } from '../../types';
import { useAnalysisState } from './analysis/useAnalysisState';
import { analyzeConversation } from './analysis/analyzerService';
import { chatRepository } from '@/repositories/chatRepository';

export const useConversationAnalysis = (
  savedApiKey: string | null, 
  conversation: ConversationMessage[],
  chatId?: string,
  shareId?: string,
  initialAnalysis?: string,
  initialAnalyzerModel?: string
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

  const [isSaved, setIsSaved] = React.useState(false);

  // Load initial analysis from saved chat
  React.useEffect(() => {
    if (initialAnalysis && !analysisResults) {
      setAnalysisResults(initialAnalysis);
      setIsSaved(true); // Already saved in DB
    }
    if (initialAnalyzerModel) {
      setAnalyzerModel(initialAnalyzerModel);
    }
  }, [initialAnalysis, initialAnalyzerModel]);

  const handleAnalyzeConversation = async (model?: string, prompt?: string) => {
    // Always use shared key mode (edge function with server-side API key)
    const effectiveApiKey: string | null = null;
    
    console.log("Analysis using shared key mode");

    const selectedModel = model || analyzerModel;
    
    setIsAnalyzing(true);
    setAnalysisResults('');
    
    try {
      const analysis = await analyzeConversation(
        conversation,
        selectedModel,
        effectiveApiKey,
        prompt,
        'long',
        chatId,
        shareId
      );
      
      setAnalysisResults(analysis);
      setIsSaved(false); // Not saved yet
      
      // Save analysis to database if we have a valid chatId (not guest)
      if (chatId && !chatRepository.isGuestChat(chatId)) {
        await chatRepository.updateChatSettings(chatId, {
          analysisResults: analysis,
          analysisModel: selectedModel,
          analyzedAt: new Date().toISOString()
        });
        setIsSaved(true);
        console.log('[Analysis] Saved to database for chat:', chatId);
      }
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
    handleAnalyzeConversation,
    isSaved
  };
};
