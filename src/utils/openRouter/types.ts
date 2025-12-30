
// Types for OpenRouter API
export interface OpenRouterMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
}

export interface OpenRouterUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
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
  usage?: OpenRouterUsage;
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
