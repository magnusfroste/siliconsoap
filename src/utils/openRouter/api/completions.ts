import { toast } from "@/hooks/use-toast";
import { OpenRouterMessage, OpenRouterResponse, ResponseLength } from "../types";
import { OPENROUTER_API_URL, createSystemPrompt, getMaxTokens } from "../constants";
import { supabase } from "@/integrations/supabase/client";

/**
 * Direct call to OpenRouter (BYOK). This is the legacy path and is also used
 * as a fallback when the edge function fails for any reason.
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

  const systemPrompt = createSystemPrompt(persona, responseLength);
  const maxTokens = getMaxTokens(responseLength);

  const messages: OpenRouterMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: prompt },
  ];

  try {
    console.log(`Calling OpenRouter directly with model: ${model}`);
    console.log("Using API key:", apiKey ? `${apiKey.substring(0, 8)}...` : "none");

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Magnus Froste Labs",
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
        top_p: 0.9,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenRouter API error (direct):", errorData);

      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }

      throw new Error(errorData.error?.message || "Failed to get response from AI model.");
    }

    const data: OpenRouterResponse = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenRouter directly:", error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Failed to get response from AI model.");
  }
};

/**
 * Calls OpenRouter API via edge function (supports shared key + BYOK).
 * If user has their own API key, calls OpenRouter directly to avoid edge function overhead.
 * Edge function is only used when there's no user API key (shared key scenario).
 */
export const callOpenRouterViaEdge = async (
  prompt: string,
  model: string,
  persona: string,
  userApiKey: string | null,
  responseLength: ResponseLength = "medium"
): Promise<string> => {
  // If user has their own API key, call OpenRouter directly
  // This avoids edge function DNS issues and is more efficient
  if (userApiKey) {
    console.log("User has API key, calling OpenRouter directly");
    return await callOpenRouter(prompt, model, persona, userApiKey, responseLength);
  }

  // No user API key - use edge function with shared key
  const systemPrompt = createSystemPrompt(persona, responseLength);
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
      temperature: 0.7,
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

    if ((data as any)?.error) {
      console.error("OpenRouter API error via edge:", data);

      // Handle rate limit with BYOK prompt (shared key hitting limits)
      if ((data as any).code === "RATE_LIMIT" && (data as any).shouldPromptBYOK) {
        const err = new Error((data as any).message) as Error & { shouldPromptBYOK: boolean };
        err.shouldPromptBYOK = true;
        throw err;
      }

      throw new Error((data as any).error);
    }

    return (data as OpenRouterResponse).choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenRouter via edge:", error);
    throw error;
  }
};
