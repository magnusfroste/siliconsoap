
import { ReactNode } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { OpenRouterModel } from '@/utils/openRouter';

export type ResponseLength = 'short' | 'medium' | 'long';

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

export type LabsState = {
  apiKey: string;
  savedApiKey: string;
  userApiKey: string;
  isSaving: boolean;
  isSaved: boolean;
  isUsingEnvKey: boolean;
  agentAModel: string;
  agentBModel: string;
  agentCModel: string;
  agentAPersona: string;
  agentBPersona: string;
  agentCPersona: string;
  rounds: number;
  numberOfAgents: number;
  responseLength: ResponseLength;
  conversation: ConversationMessage[];
  isLoading: boolean;
  availableModels: OpenRouterModel[];
  loadingModels: boolean;
  currentStep: number;
  activeScenario: string;
  promptInputs: {[key: string]: string};
  isAnalyzing: boolean;
  analysisResults: string;
  analyzerModel: string;
};

export type LabsActions = {
  setApiKey: (key: string) => void;
  setSavedApiKey: (key: string) => void;
  setUserApiKey: (key: string) => void;
  setIsSaving: (saving: boolean) => void;
  setIsSaved: (saved: boolean) => void;
  setAgentAModel: (model: string) => void;
  setAgentBModel: (model: string) => void;
  setAgentCModel: (model: string) => void;
  setAgentAPersona: (persona: string) => void;
  setAgentBPersona: (persona: string) => void;
  setAgentCPersona: (persona: string) => void;
  setRounds: (rounds: number) => void;
  setNumberOfAgents: (agents: number) => void;
  setResponseLength: (length: ResponseLength) => void;
  setConversation: React.Dispatch<React.SetStateAction<ConversationMessage[]>>;
  setIsLoading: (loading: boolean) => void;
  setAvailableModels: (models: OpenRouterModel[]) => void;
  setLoadingModels: (loading: boolean) => void;
  setCurrentStep: (step: number) => void;
  setActiveScenario: (scenario: string) => void;
  setPromptInputs: React.Dispatch<React.SetStateAction<{[key: string]: string}>>;
  setIsAnalyzing: (analyzing: boolean) => void;
  setAnalysisResults: React.Dispatch<React.SetStateAction<string>>;
  setAnalyzerModel: (model: string) => void;
  handleInputChange: (scenarioId: string, value: string) => void;
  saveApiKey: () => boolean;
  getActiveApiKey: (modelIsFree?: boolean) => string;
  goToStep: (step: number) => void;
  handleStartConversation: () => void;
  handleAnalyzeConversation: (model?: string) => void;
  handleAgentAPersonaChange: (value: string) => void;
  handleAgentBPersonaChange: (value: string) => void;
  handleAgentCPersonaChange: (value: string) => void;
  getCurrentScenario: () => ScenarioType;
  getCurrentPrompt: () => string;
  formatMessage: (text: string) => string;
};
