import { toast } from "@/hooks/use-toast";
import { OpenRouterModel, ApiError } from "./types";
import { OPENROUTER_MODELS_URL } from "./constants";

/**
 * Fetches available models from OpenRouter API
 */
export const fetchOpenRouterModels = async (apiKey: string): Promise<OpenRouterModel[]> => {
  if (!apiKey) {
    console.error("No API key provided to fetchOpenRouterModels");
    toast({
      title: "API Key Missing",
      description: "Please provide an OpenRouter API key to fetch available models",
      variant: "destructive",
    });
    return [];
  }

  try {
    console.log("Fetching models from OpenRouter API...");
    console.log("API URL:", OPENROUTER_MODELS_URL);
    console.log("API Key (first 8 chars):", apiKey.substring(0, 8));
    
    // Make a simple fetch request to test the API
    const testResponse = await fetch(OPENROUTER_MODELS_URL, {
      method: "HEAD",
    });
    console.log("Test API response status (HEAD request):", testResponse.status);
    
    const response = await fetch(OPENROUTER_MODELS_URL, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Magnus Froste Labs"
      },
    });

    console.log("OpenRouter API response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log("Error response text:", errorText);
      let errorMessage = `Failed to get models from OpenRouter (${response.status})`;
      
      try {
        // Try to parse as JSON to get a better error message
        const errorData = JSON.parse(errorText) as ApiError;
        console.log("Parsed error data:", errorData);
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        console.log("Failed to parse error as JSON:", e);
        // If parsing fails, use the raw text
        if (errorText) {
          errorMessage += `: ${errorText}`;
        }
      }
      
      console.error("OpenRouter API error:", errorMessage);
      throw new Error(errorMessage);
    }

    const responseText = await response.text();
    console.log("Response text length:", responseText.length);
    console.log("Response text preview:", responseText.substring(0, 200) + "...");
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse response as JSON:", e);
      throw new Error("Failed to parse OpenRouter API response as JSON");
    }
    
    console.log("Successfully fetched models from OpenRouter");
    console.log("Response data structure:", Object.keys(data));
    
    if (!data.data || !Array.isArray(data.data)) {
      console.error("Unexpected response format from OpenRouter:", data);
      throw new Error("Unexpected response format from OpenRouter");
    }
    
    console.log("Number of models in response:", data.data.length);
    if (data.data.length > 0) {
      console.log("Sample model data:", data.data[0]);
    }
    
    const models: OpenRouterModel[] = data.data.map((model: any) => ({
      id: model.id,
      name: model.name || model.id.split('/').pop(),
      provider: model.id.split('/')[0],
      description: model.description || "",
      isFree: model.id.includes(":free") || (model.pricing?.prompt === "0" && model.pricing?.completion === "0")
    }));

    console.log(`Processed ${models.length} models from OpenRouter`);
    if (models.length > 0) {
      console.log("Sample processed model:", models[0]);
      console.log("Providers found:", [...new Set(models.map(m => m.provider))]);
    }
    
    return models.sort((a, b) => {
      if (a.provider === b.provider) {
        return a.name.localeCompare(b.name);
      }
      return a.provider.localeCompare(b.provider);
    });
  } catch (error) {
    console.error("Error fetching OpenRouter models:", error);
    toast({
      title: "API Error",
      description: error instanceof Error ? error.message : "Failed to fetch available models",
      variant: "destructive",
    });
    return [];
  }
};

/**
 * Finds the best matching default model from available models
 */
export const findDefaultModel = (models: OpenRouterModel[], preferredIds: string[]): string | undefined => {
  if (!models.length || !preferredIds.length) {
    return undefined;
  }
  
  // Try exact match first
  for (const preferredId of preferredIds) {
    const exactMatch = models.find(m => m.id === preferredId);
    if (exactMatch) {
      return exactMatch.id;
    }
  }
  
  // If no exact match, try matching by provider 
  for (const preferredId of preferredIds) {
    const [provider] = preferredId.split('/');
    if (!provider) continue;
    
    // Look for any model from this provider
    const providerModel = models.find(m => 
      m.provider.toLowerCase() === provider.toLowerCase() && 
      (m.isFree || preferredId.includes(':free'))
    );
    
    if (providerModel) {
      return providerModel.id;
    }
  }
  
  // Final fallback - any free model or first available model
  const freeModel = models.find(m => m.isFree);
  return freeModel ? freeModel.id : models[0]?.id;
};
