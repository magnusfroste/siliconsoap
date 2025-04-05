
import { ResponseLength, AnalysisResults, ConversationMessage, ScenarioType } from '../types';

export interface LabsState {
  apiKey: string;
  savedApiKey: string;
  userApiKey: string; // Added userApiKey
  isSaving: boolean;
  isSaved: boolean;
  isUsingEnvKey: boolean; // Added isUsingEnvKey
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
  availableModels: any[];
  loadingModels: boolean;
  currentStep: number;
  activeScenario: string;
  promptInputs: {[key: string]: string};
  isAnalyzing: boolean;
  analysisResults: string; // Changed from AnalysisResults to string
  analyzerModel: string;
}

export interface LabsActions {
  setApiKey: (key: string) => void;
  setSavedApiKey: (key: string) => void;
  setUserApiKey: (key: string) => void; // Added setUserApiKey
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
  setAvailableModels: (models: any[]) => void;
  setLoadingModels: (loading: boolean) => void;
  setCurrentStep: (step: number) => void;
  setActiveScenario: (scenario: string) => void;
  setPromptInputs: React.Dispatch<React.SetStateAction<{[key: string]: string}>>;
  setIsAnalyzing: (analyzing: boolean) => void;
  setAnalysisResults: React.Dispatch<React.SetStateAction<string>>; // Changed to match the string type
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
}
