
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { callOpenRouter, isModelFree } from '@/utils/openRouter';
import { ConversationMessage, ResponseLength } from '../../types';

export const useConversationAnalysis = (
  savedApiKey: string, 
  conversation: ConversationMessage[],
  userApiKey?: string
) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<string>('');
  const [analyzerModel, setAnalyzerModel] = useState<string>('anthropic/claude-3-opus:beta');

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
    
    // Check if selected model needs a user API key
    const needsUserKey = !isModelFree(selectedModel);
    if (needsUserKey && !userApiKey) {
      toast({
        title: "API Key Required",
        description: "The selected analysis model requires your own OpenRouter API key. Please provide it in the settings.",
        variant: "destructive",
      });
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisResults('');
    
    try {
      if (conversation.length === 0) {
        toast({
          title: "No Conversation",
          description: "There is no conversation to analyze.",
          variant: "destructive",
        });
        setIsAnalyzing(false);
        return;
      }
      
      // Format the conversation for analysis
      let conversationText = "";
      conversation.forEach(entry => {
        conversationText += `${entry.agent} (${entry.persona}): ${entry.message}\n\n`;
      });
      
      const analysisPrompt = `
        Analyze the following multi-agent AI conversation. ${prompt ? `The conversation was about: "${prompt}"` : ""}
        
        ${conversationText}
        
        Please provide an analysis of:
        1. The main points and insights from the conversation
        2. How each agent's unique perspective contributed
        3. Areas of agreement and disagreement
        4. Overall quality of the discussion
        5. Suggestions for further exploration
        
        Format your response with clear headings and bullet points where appropriate.
      `;
      
      const analysis = await callOpenRouter(
        analysisPrompt,
        selectedModel,
        'analytical', 
        savedApiKey,
        'long' as ResponseLength,
        userApiKey
      );
      
      setAnalysisResults(analysis);
    } catch (error) {
      console.error("Error analyzing conversation:", error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze the conversation. Please try again.",
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
