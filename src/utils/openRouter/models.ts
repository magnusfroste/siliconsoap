
// Models for OpenRouter API
// Centralized model definitions to avoid duplication

/**
 * Default models for each agent when initializing the application
 */
export const DEFAULT_MODEL_IDS = {
  agentA: "meta-llama/llama-3.3-70b-instruct:free", // Meta Llama 3.3 70B Instruct (free)
  agentB: "deepseek/deepseek-chat-v3-0324:free",    // DeepSeek V3 (free)
  agentC: "google/gemma-3-27b:free"                 // Google Gemma 3 27B (free)
};

/**
 * Prioritized list of models to try for Agent A (analytical tasks)
 */
export const AGENT_A_PREFERRED_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'meta-llama/llama-3.1-70b-instruct:free',
  'meta-llama/llama-3.1-8b-instruct:free'
];

/**
 * Prioritized list of models to try for Agent B (creative tasks)
 */
export const AGENT_B_PREFERRED_MODELS = [
  'deepseek/deepseek-chat-v3-0324:free',
  'deepseek-ai/deepseek-v3:free',
  'qwen/qwen2.5-72b-instruct:free',
  'deepseek-ai/deepseek-r1-distill-qwen-32b:free'
];

/**
 * Prioritized list of models to try for Agent C (strategic tasks)
 */
export const AGENT_C_PREFERRED_MODELS = [
  'google/gemma-3-27b:free',
  'google/gemma-3-8b:free',
  'google/gemma-2-27b:free'
];
