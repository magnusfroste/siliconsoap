import { OpenRouterMessage, OpenRouterResponse, OpenRouterUsage, ResponseLength } from "../types";
import { createSystemPrompt, getMaxTokens } from "../constants";
import { supabase } from "@/integrations/supabase/client";

export interface CompletionResult {
  content: string;
  usage?: OpenRouterUsage;
  model: string;
  fallbackUsed?: boolean;
  originalModel?: string;
}

// Edge function response type that includes error handling
interface EdgeFunctionResponse {
  error?: string;
  code?: string;
  choices?: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: OpenRouterUsage;
  model: string;
  fallback_used?: boolean;
  original_model?: string;
}

/**
 * Calls OpenRouter API via edge function (shared key only).
 * All API calls go through the edge function for security.
 * Returns both content and usage data for token tracking.
 */
export const callOpenRouterViaEdge = async (
  prompt: string,
  model: string,
  persona: string,
  userApiKey: string | null,
  responseLength: ResponseLength = "medium",
  temperature: number = 0.7
): Promise<string> => {
  const result = await callOpenRouterWithUsage(prompt, model, persona, userApiKey, responseLength, temperature);
  return result.content;
};

/**
 * Calls OpenRouter API via edge function and returns full result including token usage.
 */
export const callOpenRouterWithUsage = async (
  prompt: string,
  model: string,
  persona: string,
  userApiKey: string | null,
  responseLength: ResponseLength = "medium",
  temperature: number = 0.7
): Promise<CompletionResult> => {
  const systemPrompt = await createSystemPrompt(persona, responseLength);
  const maxTokens = getMaxTokens(responseLength);

  const messages: OpenRouterMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: prompt },
  ];

  try {
    console.log(`Calling OpenRouter via edge function with model: ${model}`);
    console.log("Using shared API key");

    const payload = {
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
      top_p: 0.9,
    };

    const { data, error } = await supabase.functions.invoke("openrouter-chat", {
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (error) {
      console.error("Edge function error:", error);
      throw error;
    }

    const response = data as EdgeFunctionResponse;

    if (response.error) {
      console.error("OpenRouter API error via edge:", data);

      // Handle rate limit
      if (response.code === "RATE_LIMIT") {
        throw new Error("Rate limit exceeded. Please try again later.");
      }

      throw new Error(response.error);
    }

    if (!response.choices || !response.choices[0] || !response.choices[0].message) {
      throw new Error("Invalid response format from edge function");
    }
    
    return {
      content: response.choices[0].message.content,
      usage: response.usage,
      model: response.model,
      fallbackUsed: response.fallback_used,
      originalModel: response.original_model
    };
  } catch (error) {
    console.error("Error calling OpenRouter via edge:", error);
    throw error;
  }
};
