// Chat domain models - single source of truth for chat-related types

export interface ChatSettings {
  numberOfAgents: number;
  rounds: number;
  responseLength: 'short' | 'medium' | 'long';
  participationMode: 'spectator' | 'jump-in' | 'round-by-round';
  turnOrder: 'sequential' | 'random' | 'popcorn';
  models: {
    agentA: string;
    agentB: string;
    agentC: string;
  };
  personas: {
    agentA: string;
    agentB: string;
    agentC: string;
  };
  // Expert settings
  conversationTone?: 'formal' | 'casual' | 'heated' | 'collaborative';
  agreementBias?: number;
  temperature?: number;
  personalityIntensity?: 'mild' | 'moderate' | 'extreme';
}

export interface Chat {
  id: string;
  title: string;
  scenario_id: string;
  prompt: string;
  settings: ChatSettings;
  user_id?: string;
  share_id?: string;
  is_public?: boolean;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ChatMessage {
  id?: string;
  chat_id?: string;
  agent: string;
  message: string;
  model: string;
  persona: string;
  isHuman?: boolean;
  created_at?: string;
}

// Guest chat stored in localStorage
export interface GuestChat extends Chat {
  messages: ChatMessage[];
}

// Create chat input
export interface CreateChatInput {
  user_id?: string;
  title: string;
  scenario_id: string;
  prompt: string;
  settings: ChatSettings;
}
