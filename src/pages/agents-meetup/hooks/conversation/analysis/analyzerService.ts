import { toast } from '@/hooks/use-toast';
import { isModelFree } from '@/utils/openRouter';
import { callOpenRouterViaEdge } from '@/utils/openRouter/api/completions';
import { ResponseLength, ConversationMessage } from '../../../types';
import { formatConversationForAnalysis } from './conversationFormatter';
import { createAnalysisPrompt } from './analyzerPrompts';
import { supabase } from '@/integrations/supabase/client';

/**
 * Extracts shame moments from analysis and saves to Hall of Shame
 */
const extractShameMoments = async (
  analysis: string,
  chatId?: string,
  shareId?: string
): Promise<void> => {
  try {
    console.log('Extracting shame moments for Hall of Shame...');
    
    const { data, error } = await supabase.functions.invoke('extract-shame-moments', {
      body: { analysis, chatId, shareId }
    });

    if (error) {
      console.error('Error extracting shame moments:', error);
      return;
    }

    console.log('Shame extraction result:', data);
  } catch (err) {
    // Silent fail - this is a background enhancement
    console.error('Failed to extract shame moments:', err);
  }
};

/**
 * Service to handle analyzing conversations with AI
 */
export const analyzeConversation = async (
  conversation: ConversationMessage[],
  model: string,
  apiKey: string | null,
  userPrompt?: string,
  responseLength: ResponseLength = 'long',
  chatId?: string,
  shareId?: string
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
  const analysis = await callOpenRouterViaEdge(
    analysisPrompt,
    model,
    'analytical', 
    apiKey,
    responseLength
  );

  // Extract shame moments in background (fire and forget)
  extractShameMoments(analysis, chatId, shareId);
  
  return analysis;
};
