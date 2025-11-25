import { toast } from "@/hooks/use-toast";
import { OpenRouterMessage, OpenRouterResponse, ResponseLength, ApiError } from "../types";
import { OPENROUTER_API_URL, createSystemPrompt, getMaxTokens } from "../constants";
import { isModelFree } from "./modelHelper";
import { supabase } from "@/integrations/supabase/client";

/**
 * Calls OpenRouter API via edge function (supports shared key + BYOK)
 */
export const callOpenRouterViaEdge = async (
  prompt: string, 
  model: string, 
  persona: string,
  userApiKey: string | null,
  responseLength: ResponseLength = "medium"
): Promise<string> => {
  const systemPrompt = createSystemPrompt(persona, responseLength);
  const maxTokens = getMaxTokens(responseLength);

  const messages: OpenRouterMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: prompt }
  ];

  try {
    console.log(`Calling OpenRouter via edge function with model: ${model}`);
    console.log(`Using ${userApiKey ? 'user' : 'shared'} API key`);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add user's API key to header if they have one
    if (userApiKey) {
      headers['x-user-api-key'] = userApiKey;
    }

    const { data, error } = await supabase.functions.invoke('openrouter-chat', {
      body: {
        model,
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
        top_p: 0.9,
      },
      headers,
    });

    if (error) {
      console.error("Edge function error:", error);
      throw error;
    }

    if (data.error) {
      console.error("OpenRouter API error:", data);
      
      // Handle rate limit with BYOK prompt
      if (data.code === 'RATE_LIMIT' && data.shouldPromptBYOK) {
        const error = new Error(data.message) as Error & { shouldPromptBYOK: boolean };
        error.shouldPromptBYOK = true;
        throw error;
      }
      
      throw new Error(data.error);
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenRouter via edge:", error);
    throw error;
  }
};

/**
 * Calls OpenRouter API directly (legacy BYOK approach)
 */
export const callOpenRouter = async (
  prompt: string, 
  model: string, 
  persona: string,
  apiKey: string,
  responseLength: ResponseLength = "medium"
): Promise<string> => {
  if (!apiKey) {
    console.error("No API key provided for model:", model);
    throw new Error("API key is required to use this model.");
  }

  // Log model usage
  console.log(`Using model: ${model}`);

  // Create system prompt based on persona and response length
  const systemPrompt = createSystemPrompt(persona, responseLength);
  
  // Set max tokens based on response length
  const maxTokens = getMaxTokens(responseLength);

  try {
    const messages: OpenRouterMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ];

    console.log(`Calling OpenRouter with model: ${model}`);
    console.log("Using API key:", apiKey ? `${apiKey.substring(0, 8)}...` : "none");
    
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Magnus Froste Labs"
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: maxTokens,
        temperature: 0.7,
        top_p: 0.9,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenRouter API error:", errorData);
      
      // Handle rate limit errors
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      
      // Handle other API errors
      throw new Error(errorData.error?.message || "Failed to get response from AI model.");
    }

    const data: OpenRouterResponse = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenRouter:", error);
    
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("Failed to get response from AI model.");
    }
  }
};
