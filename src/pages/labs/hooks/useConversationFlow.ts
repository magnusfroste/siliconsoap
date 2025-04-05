
import { 
  useAgentConversation,
  useConversationAnalysis,
  useConversationNavigation
} from './conversation';
import { ConversationMessage, ResponseLength, ScenarioType } from '../types';

export const useConversationFlow = (
  savedApiKey: string,
  agentAModel: string,
  agentBModel: string,
  agentCModel: string,
  agentAPersona: string,
  agentBPersona: string,
  agentCPersona: string,
  numberOfAgents: number,
  rounds: number,
  responseLength: ResponseLength,
  getCurrentScenario: () => ScenarioType,
  getCurrentPrompt: () => string,
  userApiKey?: string
) => {
  // Use the navigation hook for step management
  const {
    currentStep,
    setCurrentStep,
    goToStep
  } = useConversationNavigation();

  // Use the agent conversation hook for conversation management
  const {
    conversation,
    setConversation,
    isLoading,
    setIsLoading,
    handleStartConversation: startConversation
  } = useAgentConversation(
    savedApiKey,
    agentAModel,
    agentBModel,
    agentCModel,
    agentAPersona,
    agentBPersona,
    agentCPersona,
    numberOfAgents,
    rounds,
    responseLength,
    getCurrentScenario,
    getCurrentPrompt,
    userApiKey
  );

  // Use the analysis hook for conversation analysis
  const {
    isAnalyzing,
    setIsAnalyzing,
    analysisResults,
    setAnalysisResults,
    analyzerModel,
    setAnalyzerModel,
    handleAnalyzeConversation: analyzeConversation
  } = useConversationAnalysis(savedApiKey, conversation, userApiKey);

  // Custom wrapper around startConversation that also updates the step
  const handleStartConversation = async () => {
    setCurrentStep(3); // Move to step 3 when starting conversation
    await startConversation();
  };

  // Custom wrapper around analyzeConversation that passes the current prompt
  const handleAnalyzeConversation = async (model?: string) => {
    const currentPrompt = getCurrentPrompt();
    await analyzeConversation(model, currentPrompt);
  };

  return {
    conversation,
    setConversation,
    isLoading,
    setIsLoading,
    currentStep,
    setCurrentStep,
    isAnalyzing,
    setIsAnalyzing,
    analysisResults,
    setAnalysisResults,
    analyzerModel,
    setAnalyzerModel,
    goToStep,
    handleStartConversation,
    handleAnalyzeConversation
  };
};
