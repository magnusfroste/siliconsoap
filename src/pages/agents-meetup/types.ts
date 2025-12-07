// Domain types for Agents Meetup
// Note: Chat-related types are in @/models/chat

import { ReactNode } from 'react';
import { CuratedModel } from '@/repositories/curatedModelsRepository';
import { ViewState } from './hooks/conversation/useConversationNavigation';
import { UseFormReturn } from 'react-hook-form';

// Re-export from models for convenience
export type { ChatSettings, ChatMessage } from '@/models/chat';
export type { CuratedModel } from '@/repositories/curatedModelsRepository';

export type ResponseLength = 'short' | 'medium' | 'long';
export type ParticipationMode = 'spectator' | 'jump-in' | 'round-by-round';
export type TurnOrder = 'sequential' | 'random' | 'popcorn';

export type Profile = {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  instructions?: string;
};

export type ScenarioType = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  promptTemplate: (text: string) => string;
  followupTemplate: (text: string, prevResponse: string, otherResponse: string) => string;
  finalTemplate: (text: string, prevResponse: string, otherResponse: string) => string;
  placeholder: string;
};

export type ConversationMessage = {
  agent: string;
  message: string;
  model: string;
  persona: string;
  isHuman?: boolean;
};

export type AnalysisResults = {
  agentContributions: Record<string, number>;
  topicCoverage: number;
  novelInsights: string[];
  overallScore: number;
  summary: string;
};

// Consolidated LabsState - single source of truth (simplified without BYOK)
export interface LabsState {
  apiKey: string;
  savedApiKey: string;
  isSaving: boolean;
  isSaved: boolean;
  isUsingSharedKey: boolean;
  agentAModel: string;
  agentBModel: string;
  agentCModel: string;
  agentAPersona: string;
  agentBPersona: string;
  agentCPersona: string;
  rounds: number;
  numberOfAgents: number;
  responseLength: ResponseLength;
  participationMode: ParticipationMode;
  turnOrder: TurnOrder;
  conversation: ConversationMessage[];
  isLoading: boolean;
  availableModels: CuratedModel[];
  loadingModels: boolean;
  currentView: ViewState;
  settingsOpen: boolean;
  activeScenario: string;
  promptInputs: Record<string, string>;
  isAnalyzing: boolean;
  analysisResults: any | null;
  analyzerModel: string;
  formA: UseFormReturn<{ persona: string }>;
  formB: UseFormReturn<{ persona: string }>;
  formC: UseFormReturn<{ persona: string }>;
  // Expert settings
  conversationTone: 'formal' | 'casual' | 'heated' | 'collaborative';
  agreementBias: number;
  temperature: number;
  personalityIntensity: 'mild' | 'moderate' | 'extreme';
}

// Consolidated LabsActions - single source of truth (simplified without BYOK)
export interface LabsActions {
  setApiKey: (key: string) => void;
  setSavedApiKey: (key: string) => void;
  setIsSaving: (saving: boolean) => void;
  setIsSaved: (saved: boolean) => void;
  setAgentAModel: (model: string) => void;
  setAgentBModel: (model: string) => void;
  setAgentCModel: (model: string) => void;
  setAgentAPersona: (persona: string) => void;
  setAgentBPersona: (persona: string) => void;
  setAgentCPersona: (persona: string) => void;
  setRounds: (rounds: number) => void;
  setNumberOfAgents: (number: number) => void;
  setResponseLength: (length: ResponseLength) => void;
  setParticipationMode: (mode: ParticipationMode) => void;
  setTurnOrder: (order: TurnOrder) => void;
  setConversation: (conversation: ConversationMessage[]) => void;
  setIsLoading: (loading: boolean) => void;
  setAvailableModels: (models: CuratedModel[]) => void;
  
  setCurrentView: (view: ViewState) => void;
  setSettingsOpen: (open: boolean) => void;
  setActiveScenario: (scenario: string) => void;
  setPromptInputs: (inputs: Record<string, string>) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  setAnalysisResults: (results: any | null) => void;
  setAnalyzerModel: (model: string) => void;
  handleInputChange: (scenarioId: string, value: string) => void;
  getActiveApiKey: (modelIsFree?: boolean) => string | null;
  handleStartConversation: () => Promise<void>;
  handleAnalyzeConversation: (model?: string) => Promise<void>;
  handleAgentAPersonaChange: (value: string) => void;
  handleAgentBPersonaChange: (value: string) => void;
  handleAgentCPersonaChange: (value: string) => void;
  getCurrentScenario: () => ScenarioType;
  getCurrentPrompt: () => string;
  formatMessage: (message: string) => string;
  refreshModels: () => Promise<void>;
  enableSharedKeyMode: () => void;
  // Expert settings actions
  setConversationTone: (tone: 'formal' | 'casual' | 'heated' | 'collaborative') => void;
  setAgreementBias: (bias: number) => void;
  setTemperature: (temp: number) => void;
  setPersonalityIntensity: (intensity: 'mild' | 'moderate' | 'extreme') => void;
}
