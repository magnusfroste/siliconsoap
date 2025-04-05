
// Types for OpenRouter API
export interface OpenRouterMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
}

export interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    index: number;
    finish_reason: string;
  }[];
  model: string;
  created: number;
}

export interface OpenRouterModel {
  id: string;
  name: string;
  provider: string;
  description?: string;
  isFree?: boolean;
}

export interface ApiError {
  error: string;
  message: string;
}

export type ResponseLength = "short" | "medium" | "long";

// Default model IDs
export const DEFAULT_MODEL_IDS = {
  agentA: "meta-llama/llama-3.3-70b-instruct:free", // Looking for Llama 3.3 70B Instruct (free)
  agentB: "deepseek/deepseek-v3:free", // DeepSeek V3 (free)
  agentC: "google/gemma-3-27b:free" // Google Gemma 3 27B (free)
};

