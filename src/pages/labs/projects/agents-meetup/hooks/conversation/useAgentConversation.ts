import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { ConversationMessage, ResponseLength, ScenarioType } from '../../types';
import { 
  validateConversationRequirements,
  handleInitialRound,
  handleAdditionalRounds,
  checkBeforeStarting
} from './agent/conversationManager';

export const useAgentConversation = (
  apiKey: string | null,
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
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartConversation = async (): Promise<ConversationMessage[] | null> => {
    const currentPrompt = getCurrentPrompt();
    const currentScenario = getCurrentScenario();
    
    // First check API availability
    setIsLoading(true);
    
    // Double-check if we have an API key from localStorage if needed
    const storedApiKey = !apiKey ? localStorage.getItem('userOpenRouterApiKey') : null;
    const effectiveApiKey = apiKey || storedApiKey || null;
    
    console.log("Starting conversation with API key:", effectiveApiKey ? `${effectiveApiKey.substring(0, 8)}...` : "shared key");
    console.log("Agent models:", { agentAModel, agentBModel, agentCModel });
    console.log("Number of agents:", numberOfAgents);
    console.log("Rounds:", rounds);
    
    // Check if the API is available before proceeding
    const apiAvailable = await checkBeforeStarting(effectiveApiKey);
    if (!apiAvailable) {
      setIsLoading(false);
      return null;
    }
    
    // Validate requirements before starting
    if (!validateConversationRequirements(
      currentPrompt,
      effectiveApiKey,
      agentAModel,
      agentBModel,
      agentCModel,
      numberOfAgents
    )) {
      setIsLoading(false);
      return null;
    }
    
    try {
      // Clear any previous conversation
      setConversation([]);
      
      // Start with initial round
      const { 
        conversationMessages, 
        agentAResponse, 
        agentBResponse 
      } = await handleInitialRound(
        currentPrompt,
        currentScenario,
        numberOfAgents,
        agentAModel,
        agentBModel,
        agentCModel,
        agentAPersona,
        agentBPersona,
        agentCPersona,
        effectiveApiKey,
        responseLength,
        undefined
      );
      
      // Update conversation with initial messages
      setConversation(conversationMessages);
      
      let finalMessages = conversationMessages;
      
      // If more than one round, handle additional rounds
      if (rounds > 1) {
        const additionalMessages = await handleAdditionalRounds(
          currentPrompt,
          currentScenario,
          rounds,
          numberOfAgents,
          agentAModel,
          agentBModel,
          agentCModel,
          agentAPersona,
          agentBPersona,
          agentCPersona,
          agentAResponse,
          agentBResponse,
          conversationMessages,
          effectiveApiKey,
          responseLength,
          undefined
        );
        
        // Update conversation with all messages
        setConversation(additionalMessages);
        finalMessages = additionalMessages;
      }
      
      toast({
        title: "Conversation Complete",
        description: `Agents have completed their ${rounds} round${rounds > 1 ? 's' : ''} of conversation.`,
      });
      
      return finalMessages;
    } catch (error) {
      console.error("Error in conversation flow:", error);
      
      // Check if this is a rate limit error that should prompt BYOK
      if (error instanceof Error && 'shouldPromptBYOK' in error && (error as any).shouldPromptBYOK) {
        toast({
          title: "Rate Limit Reached",
          description: "Shared API key limit reached. Please add your own OpenRouter API key to continue with unlimited usage.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Conversation Error",
          description: error instanceof Error ? error.message : "An error occurred during the conversation.",
          variant: "destructive",
        });
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    conversation,
    setConversation,
    isLoading,
    setIsLoading,
    handleStartConversation
  };
};
