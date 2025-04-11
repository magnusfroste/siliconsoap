import { 
  useAgentConversation,
  useConversationAnalysis,
  useConversationNavigation
} from './conversation';
import { ConversationMessage, ResponseLength, ScenarioType } from '../types';
import { checkApiAvailability } from '@/utils/openRouter';
import { toast } from '@/hooks/use-toast';

export const useConversationFlow = (
  apiKey: string,
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
  getCurrentPrompt: () => string
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
    apiKey,
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
    getCurrentPrompt
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
  } = useConversationAnalysis(apiKey, conversation);

  // Custom wrapper around startConversation that also updates the step
  const handleStartConversation = async () => {
    console.log("Starting conversation...");
    console.log("- apiKey exists:", !!apiKey);
    console.log("- apiKey length:", apiKey ? apiKey.length : 0);
    console.log("- agentAModel:", agentAModel);
    console.log("- agentBModel:", agentBModel);
    console.log("- agentCModel:", agentCModel);
    console.log("- numberOfAgents:", numberOfAgents);
    
    // Set loading state immediately to prevent multiple clicks
    setIsLoading(true);
    
    // Double-check if we have an API key from localStorage
    const storedApiKey = localStorage.getItem('userOpenRouterApiKey');
    if (!apiKey && storedApiKey) {
      console.log("Using API key from localStorage");
      // We'll use the stored API key for the conversation
    }
    
    const effectiveApiKey = apiKey || storedApiKey || '';
    
    // Check if API key is provided
    if (!effectiveApiKey) {
      toast({
        title: "API Key Required",
        description: "Please provide your OpenRouter API key to use this feature.",
        variant: "destructive",
      });
      goToStep(1); // Go back to the API key input step
      setIsLoading(false);
      return;
    }
    
    // Check if we have valid models selected
    if (!agentAModel || (numberOfAgents >= 2 && !agentBModel) || (numberOfAgents >= 3 && !agentCModel)) {
      toast({
        title: "Models Required",
        description: "Please select models for all active agents.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    // Check if we have a valid prompt
    const currentPrompt = getCurrentPrompt();
    if (!currentPrompt.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter text or a prompt for the agents to analyze.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    // Check API availability before starting
    try {
      console.log("Checking API availability with key:", effectiveApiKey.substring(0, 8) + "...");
      const result = await checkApiAvailability(effectiveApiKey);
      
      if (!result.available) {
        console.error("API not available:", result.message);
        
        toast({
          title: "API Error",
          description: result.message,
          variant: "destructive",
        });
        
        // Go back to step 1 (API key input) if there's an issue
        goToStep(1);
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error("Error checking API availability:", error);
      
      toast({
        title: "API Error",
        description: "Failed to check API availability. Please try again.",
        variant: "destructive",
      });
      
      setIsLoading(false);
      return;
    }
    
    // Only move to the next step if API is available
    setCurrentStep(3);
    
    try {
      console.log("Starting conversation with API key:", effectiveApiKey.substring(0, 8) + "...");
      await startConversation();
    } catch (error) {
      console.error("Error starting conversation:", error);
      
      // For errors, show a generic error message
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({
        title: "Error Starting Conversation",
        description: errorMessage || "An error occurred while starting the conversation. Please try again.",
        variant: "destructive",
      });
      
      setIsLoading(false);
    }
  };

  // Custom wrapper around analyzeConversation that passes the current prompt
  const handleAnalyzeConversation = async (model?: string) => {
    console.log("Analyzing conversation...");
    console.log("- apiKey exists:", !!apiKey);
    
    // Double-check if we have an API key from localStorage
    const storedApiKey = localStorage.getItem('userOpenRouterApiKey');
    if (!apiKey && storedApiKey) {
      console.log("Using API key from localStorage for analysis");
      // We'll use the stored API key for the analysis
    }
    
    const effectiveApiKey = apiKey || storedApiKey || '';
    
    // Check if API key is provided
    if (!effectiveApiKey) {
      toast({
        title: "API Key Required",
        description: "Please provide your OpenRouter API key to continue.",
        variant: "destructive",
      });
      goToStep(1);
      return;
    }
    
    // Check API availability before analyzing
    try {
      console.log("Checking API availability for analysis with key:", effectiveApiKey.substring(0, 8) + "...");
      const result = await checkApiAvailability(effectiveApiKey);
      
      if (!result.available) {
        console.error("API not available for analysis:", result.message);
        
        toast({
          title: "API Error",
          description: result.message,
          variant: "destructive",
        });
        
        return; // Don't proceed further
      }
      
      const currentPrompt = getCurrentPrompt();
      setIsAnalyzing(true);
      
      try {
        await analyzeConversation(model, currentPrompt);
      } catch (error) {
        console.error("Error analyzing conversation:", error);
        
        // For errors, show a generic error message
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast({
          title: "Error Analyzing Conversation",
          description: errorMessage || "An error occurred while analyzing the conversation. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsAnalyzing(false);
      }
    } catch (error) {
      console.error("Error checking API availability for analysis:", error);
      
      toast({
        title: "API Error",
        description: "Failed to check API availability. Please try again.",
        variant: "destructive",
      });
    }
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
