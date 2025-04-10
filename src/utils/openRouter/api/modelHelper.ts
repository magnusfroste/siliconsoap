
/**
 * Determines if a model is free based on its ID
 */
export const isModelFree = (modelId: string): boolean => {
  return modelId.includes(':free') || 
         modelId.includes('free') ||
         modelId.includes('/deepseek-r1-distill-qwen-32b') ||
         modelId.includes('/gemma-3-27b');
};
