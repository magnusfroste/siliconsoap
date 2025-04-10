
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { ConversationMessage, ResponseLength, ScenarioType } from '../../types';
import { 
  validateConversationRequirements,
  handleInitialRound,
  handleAdditionalRounds
} from './agent/conversationManager';

export const useAgentConversation = (
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
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartConversation = async () => {
    const currentPrompt = getCurrentPrompt();
    const currentScenario = getCurrentScenario();
    
    // Validate requirements before starting
    if (!validateConversationRequirements(
      currentPrompt,
      savedApiKey,
      agentAModel,
      agentBModel,
      agentCModel,
      numberOfAgents,
      userApiKey
    )) {
      return;
    }
    
    setConversation([]);
    setIsLoading(true);
    
    try {
      // Handle the first round of conversation
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
        savedApiKey,
        responseLength,
        userApiKey
      );
      
      setConversation(conversationMessages);
      
      // If only one round is required or only one agent, we're done
      if (rounds <= 1 || numberOfAgents === 1) {
        setIsLoading(false);
        return;
      }
      
      // Handle additional rounds if needed
      const updatedConversation = await handleAdditionalRounds(
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
        savedApiKey,
        responseLength,
        userApiKey
      );
      
      setConversation(updatedConversation);
      
    } catch (error) {
      console.error("Error in agent conversation:", error);
      toast({
        title: "Error",
        description: "Failed to get responses from AI models. Please try again.",
        variant: "destructive",
      });
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
