// API endpoints and configuration constants
export const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
export const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models";

// Helper function to get token count based on response length
export const getMaxTokens = (responseLength: string): number => {
  switch (responseLength) {
    case "short":
      return 200;
    case "medium":
      return 500;
    case "long":
      return 1000;
    default:
      return 500;
  }
};

// Helper function to create system prompt based on persona
export const createSystemPrompt = (persona: string, responseLength: string): string => {
  let systemPrompt = "You are an AI assistant analyzing text.";
  
  switch (persona) {
    case "analytical":
      systemPrompt = "You are an Analytical Expert AI. Focus on detailed logical analysis with precise reasoning. Be thorough in examining patterns, data points, and factual evidence. Your tone should be professional, objective, and methodical.";
      break;
    case "creative":
      systemPrompt = "You are a Creative Thinker AI. Emphasize novel perspectives and out-of-box thinking. Draw unexpected connections, use metaphors, and propose innovative interpretations. Your tone should be imaginative, exploratory, and inspiring.";
      break;
    case "teacher":
      systemPrompt = "You are a Teacher AI. Explain concepts clearly with an educational approach. Break down complex ideas into digestible parts and use examples to illustrate points. Your tone should be helpful, patient, and encouraging.";
      break;
    case "empathetic":
      systemPrompt = "You are an Empathetic Advisor AI. Understand emotional contexts and provide compassionate responses. Consider the human elements in the text, potential feelings, and social dynamics. Your tone should be warm, understanding, and supportive.";
      break;
  }

  // Add response length instruction to the system prompt
  switch (responseLength) {
    case "short":
      systemPrompt += " Provide very concise responses (1-2 sentences). Be direct and to the point.";
      break;
    case "medium":
      systemPrompt += " Provide moderately detailed responses (3-5 sentences). Balance detail with brevity.";
      break;
    case "long":
      systemPrompt += " Provide comprehensive, detailed responses. Elaborate on key points and provide thorough analysis.";
      break;
  }
  
  return systemPrompt;
};
