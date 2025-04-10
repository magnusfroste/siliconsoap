
import { 
  useAgentConversation,
  useConversationAnalysis,
  useConversationNavigation
} from './conversation';
import { ConversationMessage, ResponseLength, ScenarioType } from '../types';
import { checkApiAvailability } from '@/utils/openRouter';

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
    userApiKey // Pass userApiKey to useAgentConversation
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
  } = useConversationAnalysis(savedApiKey, conversation, userApiKey); // Pass userApiKey to useConversationAnalysis

  // Custom wrapper around startConversation that also updates the step
  const handleStartConversation = async () => {
    console.log("Starting conversation...");
    console.log("- savedApiKey exists:", !!savedApiKey);
    console.log("- userApiKey exists:", !!userApiKey);
    console.log("- agentAModel:", agentAModel);
    console.log("- agentBModel:", agentBModel);
    console.log("- agentCModel:", agentCModel);
    
    // First explicitly check API availability before changing steps
    // This is a pre-emptive check to avoid changing the UI state if the API is unavailable
    const apiAvailable = await checkApiAvailability(savedApiKey, userApiKey);
    if (!apiAvailable.available) {
      console.error("API availability check failed before changing step:", apiAvailable.message);
      return; // Don't proceed further - the error toast will be shown by checkApiAvailability
    }
    
    // Only move to the next step if API is available
    setCurrentStep(3);
    await startConversation();
  };

  // Custom wrapper around analyzeConversation that passes the current prompt
  const handleAnalyzeConversation = async (model?: string) => {
    console.log("Analyzing conversation...");
    console.log("- savedApiKey exists:", !!savedApiKey);
    console.log("- userApiKey exists:", !!userApiKey);
    
    // Check API availability before analyzing
    const apiAvailable = await checkApiAvailability(savedApiKey, userApiKey);
    if (!apiAvailable.available) {
      console.error("API availability check failed before analysis:", apiAvailable.message);
      return; // Don't proceed further
    }
    
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
