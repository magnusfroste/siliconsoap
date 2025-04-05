
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

// Importing default model IDs from dedicated models file
import { DEFAULT_MODEL_IDS } from './models';
export { DEFAULT_MODEL_IDS };
