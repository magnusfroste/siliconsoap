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
 * If the edge function fails (e.g. internal error), it falls back to the
 * direct BYOK call when a userApiKey is available.
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
    { role: "user", content: prompt },
  ];

  try {
    console.log(`Calling OpenRouter via edge function with model: ${model}`);
    console.log(`Using ${userApiKey ? "user" : "shared"} API key`);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (userApiKey) {
      headers["x-user-api-key"] = userApiKey;
    }

    const payload = {
      model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
      top_p: 0.9,
    };

    const { data, error } = await supabase.functions.invoke("openrouter-chat", {
      body: JSON.stringify(payload),
      headers,
    });

    if (error) {
      console.error("Edge function error:", error);

      // Fallback to direct call when we have a user key
      if (userApiKey) {
        console.log("Falling back to direct OpenRouter call due to edge function error.");
        return await callOpenRouter(prompt, model, persona, userApiKey, responseLength);
      }

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

      // If the edge function reports an internal error but we have a user key,
      // fall back to direct call.
      if (userApiKey && (data as any).code === "INTERNAL_ERROR") {
        console.log("Edge function INTERNAL_ERROR, falling back to direct OpenRouter call.");
        return await callOpenRouter(prompt, model, persona, userApiKey, responseLength);
      }

      throw new Error((data as any).error);
    }

    return (data as OpenRouterResponse).choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenRouter via edge:", error);

    // Final safety fallback: if anything goes wrong and we have a user key,
    // try the direct path once.
    if (userApiKey) {
      console.log("Final fallback to direct OpenRouter call from catch block.");
      return await callOpenRouter(prompt, model, persona, userApiKey, responseLength);
    }

    throw error;
  }
};
