
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
  savedApiKey: string,
  userPrompt?: string,
  responseLength: ResponseLength = 'long',
  userApiKey?: string
): Promise<string> => {
  // Check if there's a conversation to analyze
  if (conversation.length === 0) {
    throw new Error("No conversation to analyze");
  }
  
  // Check if selected model needs a user API key
  const needsUserKey = !isModelFree(model);
  if (needsUserKey && !userApiKey) {
    throw new Error("The selected analysis model requires your own OpenRouter API key");
  }

  // Format the conversation for analysis
  const conversationText = formatConversationForAnalysis(conversation);
  
  // Create the analysis prompt
  const analysisPrompt = createAnalysisPrompt(conversationText, userPrompt);
  
  // Call the API to get the analysis
  return callOpenRouter(
    analysisPrompt,
    model,
    'analytical', 
    savedApiKey,
    responseLength,
    userApiKey
  );
};
