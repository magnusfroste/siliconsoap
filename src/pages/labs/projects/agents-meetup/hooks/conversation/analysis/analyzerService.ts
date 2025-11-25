import { toast } from '@/hooks/use-toast';
import { isModelFree } from '@/utils/openRouter';
import { callOpenRouterViaEdge } from '@/utils/openRouter/api/completions';
import { ResponseLength, ConversationMessage } from '../../../types';
import { formatConversationForAnalysis } from './conversationFormatter';
import { createAnalysisPrompt } from './analyzerPrompts';

/**
 * Service to handle analyzing conversations with AI
 */
export const analyzeConversation = async (
  conversation: ConversationMessage[],
  model: string,
  apiKey: string | null,
  userPrompt?: string,
  responseLength: ResponseLength = 'long'
): Promise<string> => {
  // Check if there's a conversation to analyze
  if (conversation.length === 0) {
    throw new Error("No conversation to analyze");
  }
  
  // API key is optional now (shared key mode)

  // Format the conversation for analysis
  const conversationText = formatConversationForAnalysis(conversation);
  
  // Create the analysis prompt
  const analysisPrompt = createAnalysisPrompt(conversationText, userPrompt);
  
  console.log("Analyzing conversation with model:", model);
  console.log("Using API key:", apiKey ? `${apiKey.substring(0, 8)}...` : "shared key");
  
  // Call the API to get the analysis via edge function
  return callOpenRouterViaEdge(
    analysisPrompt,
    model,
    'analytical', 
    apiKey,
    responseLength
  );
};
