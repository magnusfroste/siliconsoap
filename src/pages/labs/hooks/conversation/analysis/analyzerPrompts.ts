
/**
 * Generates prompts for the conversation analysis
 */

/**
 * Creates a prompt for analyzing the conversation
 * @param conversationText Formatted conversation text
 * @param userPrompt Optional user prompt/context for the conversation
 * @returns Analysis prompt for the AI
 */
export const createAnalysisPrompt = (conversationText: string, userPrompt?: string): string => {
  return `
    Analyze the following multi-agent AI conversation. ${userPrompt ? `The conversation was about: "${userPrompt}"` : ""}
    
    ${conversationText}
    
    Please provide an analysis of:
    1. The main points and insights from the conversation
    2. How each agent's unique perspective contributed
    3. Areas of agreement and disagreement
    4. Overall quality of the discussion
    5. Suggestions for further exploration
    
    Format your response with clear headings and bullet points where appropriate. Use markdown formatting for better readability.
  `;
};
