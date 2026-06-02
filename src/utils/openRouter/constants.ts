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

import { supabase } from '@/integrations/supabase/client';

// Helper function to create system prompt based on persona
export const createSystemPrompt = async (persona: string, responseLength: string): Promise<string> => {
  // The caller may have appended extra instructions (e.g. LANGUAGE_INSTRUCTION) to the
  // persona string. The actual DB slug is only the first token; strip the suffix for
  // the lookup, then re-append it to the resolved instructions.
  const trimmed = persona.trim();
  const slugMatch = trimmed.match(/^([a-z0-9_-]+)/i);
  const slug = slugMatch ? slugMatch[1] : trimmed.split(/\s/)[0];
  const suffix = trimmed.slice(slug.length); // preserves language directive etc.

  const { data: profile } = await supabase
    .from('agent_profiles')
    .select('instructions')
    .eq('slug', slug)
    .maybeSingle();

  let systemPrompt = profile?.instructions || "You are an AI assistant analyzing text.";

  switch (responseLength) {
    case "short":
      systemPrompt += " Keep your response to 1-2 sentences. Be direct and to the point.";
      break;
    case "medium":
      systemPrompt += " Provide 3-5 sentences in your response. Balance detail with brevity.";
      break;
    case "long":
      systemPrompt += " Provide a comprehensive, detailed response. Elaborate on key points and provide thorough analysis.";
      break;
  }

  if (suffix) systemPrompt += suffix;

  return systemPrompt;
};
