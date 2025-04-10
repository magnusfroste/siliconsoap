
import { ConversationMessage } from '../../../types';

/**
 * Formats a conversation into a readable text format for analysis
 * @param conversation List of conversation messages
 * @returns Formatted conversation text
 */
export const formatConversationForAnalysis = (conversation: ConversationMessage[]): string => {
  let conversationText = "";
  conversation.forEach(entry => {
    conversationText += `${entry.agent} (${entry.persona}): ${entry.message}\n\n`;
  });
  return conversationText;
};
