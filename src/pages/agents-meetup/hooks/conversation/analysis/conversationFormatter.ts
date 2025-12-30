
import { ConversationMessage } from '../../../types';
import { getAgentSoapName } from '../../../utils/agentNameGenerator';

/**
 * Formats a conversation into a readable text format for analysis
 * Uses soap opera names instead of "Agent A/B/C" for a more dramatic feel
 * @param conversation List of conversation messages
 * @returns Formatted conversation text
 */
export const formatConversationForAnalysis = (conversation: ConversationMessage[]): string => {
  let conversationText = "";
  conversation.forEach(entry => {
    // Use soap opera name for dramatic effect
    const soapName = getAgentSoapName(entry.agent, entry.persona);
    conversationText += `${soapName} (${entry.persona}): ${entry.message}\n\n`;
  });
  return conversationText;
};
