
// Models for OpenRouter API
// Centralized model definitions to avoid duplication

/**
 * Default models for each agent when initializing the application
 */
export const DEFAULT_MODEL_IDS = {
  agentA: "meta-llama/llama-3.3-70b-instruct", // Meta Llama 3.3 70B Instruct
  agentB: "deepseek/deepseek-chat-v3-0324",    // DeepSeek V3
  agentC: "google/gemma-3-27b-it"              // Google Gemma 3 27B
};

/**
 * Prioritized list of models to try for Agent A (analytical tasks)
 */
export const AGENT_A_PREFERRED_MODELS = [
  'meta-llama/llama-3.3-70b-instruct'
];

/**
 * Prioritized list of models to try for Agent B (creative tasks)
 */
export const AGENT_B_PREFERRED_MODELS = [
  'deepseek/deepseek-chat-v3-0324'
];

/**
 * Prioritized list of models to try for Agent C (strategic tasks)
 */
export const AGENT_C_PREFERRED_MODELS = [
  'google/gemma-3-27b-it'
];
