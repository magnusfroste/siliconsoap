import { toast } from '@/hooks/use-toast';
import { callOpenRouter, isModelFree } from '@/utils/openRouter';
import { ResponseLength, ConversationMessage } from '../../../types';
import { formatConversationForAnalysis } from './conversationFormatter';
import { createAnalysisPrompt } from './analyzerPrompts';

/**
 * Service to handle analyzing conversations with AI
 */
export const analyzeConversation = async (
  conversation: ConversationMessage[],
  model: string,
  apiKey: string,
  userPrompt?: string,
  responseLength: ResponseLength = 'long'
): Promise<string> => {
  // Check if there's a conversation to analyze
  if (conversation.length === 0) {
    throw new Error("No conversation to analyze");
  }
  
  // Check if we have an API key
  if (!apiKey) {
    throw new Error("API key is required for analysis");
  }

  // Format the conversation for analysis
  const conversationText = formatConversationForAnalysis(conversation);
  
  // Create the analysis prompt
  const analysisPrompt = createAnalysisPrompt(conversationText, userPrompt);
  
  console.log("Analyzing conversation with model:", model);
  console.log("Using API key:", apiKey ? `${apiKey.substring(0, 8)}...` : "none");
  
  // Call the API to get the analysis
  return callOpenRouter(
    analysisPrompt,
    model,
    'analytical', 
    apiKey,
    responseLength
  );
};
