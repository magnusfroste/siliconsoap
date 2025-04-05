
import { toast } from "@/hooks/use-toast";
import { OpenRouterModel, ApiError } from "./types";
import { OPENROUTER_MODELS_URL } from "./constants";

/**
 * Fetches available models from OpenRouter API
 */
export const fetchOpenRouterModels = async (apiKey: string): Promise<OpenRouterModel[]> => {
  if (!apiKey) {
    toast({
      title: "API Key Missing",
      description: "Please provide an OpenRouter API key to fetch available models",
      variant: "destructive",
    });
    return [];
  }

  try {
    const response = await fetch(OPENROUTER_MODELS_URL, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.origin,
      },
    });

    if (!response.ok) {
      const errorData = await response.json() as ApiError;
      throw new Error(errorData.message || "Failed to get models from OpenRouter");
    }

    const data = await response.json();
    
    const models: OpenRouterModel[] = data.data.map((model: any) => ({
      id: model.id,
      name: model.name || model.id.split('/').pop(),
      provider: model.id.split('/')[0],
      description: model.description || "",
      isFree: model.id.includes(":free") || model.pricing?.prompt === "0" && model.pricing?.completion === "0"
    }));

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
  console.log("Finding default model from", { 
    modelsCount: models.length, 
    preferredIds
  });

  // Special handling for Agent B (DeepSeek R1)
  if (preferredIds[0] === 'deepseek-ai/deepseek-r1-distill-qwen-32b:free') {
    // First priority: exact match for deepseek-r1-distill-qwen-32b:free
    const exactMatch = models.find(m => m.id === 'deepseek-ai/deepseek-r1-distill-qwen-32b:free');
    if (exactMatch) {
      console.log(`Found exact match for preferred DeepSeek model:`, exactMatch.id);
      return exactMatch.id;
    }
    
    // Second priority: any deepseek-r1 variant
    const deepseekVariants = models.filter(m => 
      m.id.includes('deepseek-r1') || 
      m.id.includes('deepseek/r1'));
    
    console.log(`Looking for DeepSeek R1 variants, found:`, deepseekVariants.map(m => m.id));
    
    if (deepseekVariants.length > 0) {
      // Sort variants to prioritize free versions first
      const sortedVariants = deepseekVariants.sort((a, b) => {
        // Prioritize IDs with :free suffix
        if (a.id.includes(':free') && !b.id.includes(':free')) return -1;
        if (!a.id.includes(':free') && b.id.includes(':free')) return 1;
        return 0;
      });
      console.log(`Selected DeepSeek R1 variant:`, sortedVariants[0].id);
      return sortedVariants[0].id;
    }
  }

  // Special handling for Agent C (Gemma 3 27B)
  if (preferredIds[0] === 'google/gemma-3-27b:free') {
    // First priority: exact match for gemma-3-27b:free
    const exactMatch = models.find(m => m.id === 'google/gemma-3-27b:free');
    if (exactMatch) {
      console.log(`Found exact match for preferred Gemma 3 27B free:`, exactMatch.id);
      return exactMatch.id;
    }
    
    // Second priority: any gemma-3-27b variant
    const gemma27bVariants = models.filter(m => 
      m.id.includes('gemma-3-27b') || 
      m.id.includes('gemma-3-27b-it:free') ||
      m.id.includes('gemma-3-27b-it'));
    
    console.log(`Looking for Gemma 3 27B variants, found:`, gemma27bVariants.map(m => m.id));
    
    if (gemma27bVariants.length > 0) {
      // Sort variants to prioritize free versions first
      const sortedVariants = gemma27bVariants.sort((a, b) => {
        // Prioritize IDs with :free suffix
        if (a.id.includes(':free') && !b.id.includes(':free')) return -1;
        if (!a.id.includes(':free') && b.id.includes(':free')) return 1;
        return 0;
      });
      console.log(`Selected Gemma 3 27B variant:`, sortedVariants[0].id);
      return sortedVariants[0].id;
    }
    
    // Third priority: any Gemma 3 model
    const anyGemma3 = models.find(m => m.id.toLowerCase().includes('google/gemma-3'));
    if (anyGemma3) {
      console.log(`Found any Gemma 3 model:`, anyGemma3.id);
      return anyGemma3.id;
    }
  }

  // Regular handling for other agents
  
  // Try exact match for any of the preferred IDs
  for (const preferredId of preferredIds) {
    const exactMatch = models.find(m => m.id === preferredId);
    if (exactMatch) {
      console.log(`Found exact match for ${preferredId}:`, exactMatch.id);
      return exactMatch.id;
    }
  }
  
  // Try partial matches by provider and model name
  for (const preferredId of preferredIds) {
    const [provider, modelName] = preferredId.split('/');
    if (!provider || !modelName) continue;
    
    // Find models from the same provider
    const providerMatches = models.filter(m => 
      m.provider.toLowerCase() === provider.toLowerCase());
    
    console.log(`Provider matches for ${provider}:`, providerMatches.map(m => m.id));
    
    // Get the base model name without version tag
    const modelNameBase = modelName.split(':')[0];
    
    // Look for partial matches in model names
    for (const model of providerMatches) {
      if (
        model.name.toLowerCase().includes(modelNameBase.toLowerCase()) ||
        modelNameBase.toLowerCase().includes(model.name.toLowerCase()) ||
        model.id.toLowerCase().includes(modelNameBase.toLowerCase())
      ) {
        console.log(`Found provider and name match for ${preferredId}:`, model.id);
        return model.id;
      }
    }
  }
  
  // Fallback to free models if available
  const freeModels = models.filter(m => m.isFree);
  if (freeModels.length > 0) {
    console.log("Falling back to free model:", freeModels[0].id);
    return freeModels[0].id;
  }
  
  // Last resort: return first available model
  if (models.length > 0) {
    console.log("Falling back to first available model:", models[0].id);
    return models[0].id;
  }
  
  console.log("No models available to select from");
  return undefined;
};
