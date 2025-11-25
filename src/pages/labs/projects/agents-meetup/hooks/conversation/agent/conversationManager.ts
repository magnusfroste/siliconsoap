import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { 
  isModelFree, 
  checkApiAvailability 
} from '@/utils/openRouter';
import { callOpenRouterViaEdge } from '@/utils/openRouter/api/completions';
import { ConversationMessage, ResponseLength, ScenarioType } from '../../../types';
import {
  createAgentAInitialPrompt,
  createAgentBPrompt,
  createAgentCPrompt,
  createAgentAFollowupPrompt,
  createAgentBFinalPrompt,
  createAgentCFinalPrompt
} from './agentPrompts';

/**
 * Checks API availability before starting a conversation (optional for shared key mode)
 */
export const checkBeforeStarting = async (
  apiKey: string | null
): Promise<boolean> => {
  // If we have no API key, allow it (shared key mode via edge function)
  if (!apiKey) {
    console.log("No user API key - will use shared key via edge function");
    return true;
  }

  console.log("Checking API availability before starting conversation");
  console.log("Using API key:", apiKey ? `${apiKey.substring(0, 8)}...` : "none");
  
  try {
    const result = await checkApiAvailability(apiKey);
    
    if (!result.available) {
      console.error("API not available:", result.message);
      
      toast({
        title: "API Key Issue",
        description: result.message,
        variant: "destructive",
        duration: 5000,
      });
      
      return false;
    }
    
    console.log("API availability check passed");
    return true;
  } catch (error) {
    console.error("Error checking API availability:", error);
    
    toast({
      title: "API Error",
      description: "Failed to check API availability. Please try again.",
      variant: "destructive",
    });
    
    return false;
  }
};

/**
 * Validates conversation requirements before starting
 */
export const validateConversationRequirements = (
  currentPrompt: string,
  apiKey: string | null,
  agentAModel: string,
  agentBModel: string,
  agentCModel: string,
  numberOfAgents: number
): boolean => {
  if (!currentPrompt.trim()) {
    toast({
      title: "Input required",
      description: "Please enter text or a prompt for the agents to analyze.",
      variant: "destructive",
    });
    return false;
  }
  
  // API key is optional now (shared key mode via edge function)
  // No need to validate API key presence
  
  return true;
};

/**
 * Handles the initial round of conversation between agents
 */
export const handleInitialRound = async (
  currentPrompt: string,
  currentScenario: ScenarioType,
  numberOfAgents: number,
  agentAModel: string,
  agentBModel: string,
  agentCModel: string,
  agentAPersona: string,
  agentBPersona: string,
  agentCPersona: string,
  apiKey: string,
  responseLength: ResponseLength,
  onMessageReceived?: (message: ConversationMessage) => Promise<void>
): Promise<{
  conversationMessages: ConversationMessage[],
  agentAResponse: string,
  agentBResponse: string
}> => {
  const messages: ConversationMessage[] = [];
  
  // Agent A always starts the conversation
  const agentAPrompt = createAgentAInitialPrompt(currentPrompt, currentScenario);
  
  const agentAResponse = await callOpenRouterViaEdge(
    agentAPrompt,
    agentAModel,
    agentAPersona,
    apiKey || null,
    responseLength
  );
  
  const agentAMessage: ConversationMessage = {
    agent: 'Agent A',
    message: agentAResponse,
    model: agentAModel,
    persona: agentAPersona
  };
  
  messages.push(agentAMessage);
  if (onMessageReceived) await onMessageReceived(agentAMessage);
  
  // If only one agent, we're done
  if (numberOfAgents === 1) {
    return {
      conversationMessages: messages,
      agentAResponse,
      agentBResponse: ''
    };
  }
  
  // Agent B response
  const agentBPrompt = createAgentBPrompt(currentPrompt, agentAResponse, currentScenario);
  
  const agentBResponse = await callOpenRouterViaEdge(
    agentBPrompt,
    agentBModel,
    agentBPersona,
    apiKey || null,
    responseLength
  );
  
  const agentBMessage: ConversationMessage = {
    agent: 'Agent B',
    message: agentBResponse,
    model: agentBModel,
    persona: agentBPersona
  };
  
  messages.push(agentBMessage);
  if (onMessageReceived) await onMessageReceived(agentBMessage);
  
  // If only two agents or no additional rounds needed, we're done
  if (numberOfAgents === 2) {
    return {
      conversationMessages: messages,
      agentAResponse,
      agentBResponse
    };
  }
  
  // Agent C response (if three agents are selected)
  if (numberOfAgents === 3) {
    const agentCPrompt = createAgentCPrompt(currentPrompt, agentAResponse, agentBResponse, currentScenario);
    
    const agentCResponse = await callOpenRouterViaEdge(
      agentCPrompt,
      agentCModel,
      agentCPersona,
      apiKey || null,
      responseLength
    );
    
    const agentCMessage: ConversationMessage = {
      agent: 'Agent C',
      message: agentCResponse,
      model: agentCModel,
      persona: agentCPersona
    };
    
    messages.push(agentCMessage);
    if (onMessageReceived) await onMessageReceived(agentCMessage);
  }
  
  return {
    conversationMessages: messages,
    agentAResponse,
    agentBResponse
  };
};

/**
 * Handles additional rounds of conversation between agents
 */
export const handleAdditionalRounds = async (
  currentPrompt: string,
  currentScenario: ScenarioType,
  rounds: number,
  numberOfAgents: number,
  agentAModel: string,
  agentBModel: string,
  agentCModel: string,
  agentAPersona: string,
  agentBPersona: string,
  agentCPersona: string,
  agentAResponse: string,
  agentBResponse: string,
  conversation: ConversationMessage[],
  apiKey: string,
  responseLength: ResponseLength,
  onMessageReceived?: (message: ConversationMessage) => Promise<void>
): Promise<ConversationMessage[]> => {
  if (rounds <= 1) return conversation;
  
  const additionalMessages: ConversationMessage[] = [];
  
  // Get the latest Agent C response if it exists
  const latestAgentCResponse = conversation.find(c => c.agent === 'Agent C')?.message;
  
  // Second round - Agent A responds to previous responses
  const agentAFollowupPrompt = createAgentAFollowupPrompt(
    currentPrompt,
    agentAResponse,
    agentBResponse,
    latestAgentCResponse,
    numberOfAgents,
    currentScenario
  );
  
  const agentAFollowup = await callOpenRouterViaEdge(
    agentAFollowupPrompt,
    agentAModel,
    agentAPersona,
    apiKey || null,
    responseLength
  );
  
  const agentAFollowupMessage: ConversationMessage = {
    agent: 'Agent A',
    message: agentAFollowup,
    model: agentAModel,
    persona: agentAPersona
  };
  
  additionalMessages.push(agentAFollowupMessage);
  if (onMessageReceived) await onMessageReceived(agentAFollowupMessage);
  
  if (rounds > 2 || (rounds === 2 && numberOfAgents === 3)) {
    // Final responses for third round
    const agentBFinalPrompt = createAgentBFinalPrompt(
      currentPrompt,
      agentBResponse,
      agentAFollowup,
      numberOfAgents,
      currentScenario
    );
    
    const agentBFinal = await callOpenRouterViaEdge(
      agentBFinalPrompt,
      agentBModel,
      agentBPersona,
      apiKey || null,
      responseLength
    );
    
    const agentBFinalMessage: ConversationMessage = {
      agent: 'Agent B',
      message: agentBFinal,
      model: agentBModel,
      persona: agentBPersona
    };
    
    additionalMessages.push(agentBFinalMessage);
    if (onMessageReceived) await onMessageReceived(agentBFinalMessage);
    
    // Only for 3 agents, add final Agent C response
    if (numberOfAgents === 3 && rounds === 3) {
      const agentCFinalPrompt = createAgentCFinalPrompt(
        currentPrompt,
        agentAFollowup,
        agentBFinal,
        currentScenario
      );
      
      const agentCFinal = await callOpenRouterViaEdge(
        agentCFinalPrompt,
        agentCModel,
        agentCPersona,
        apiKey || null,
        responseLength
      );
      
      const agentCFinalMessage: ConversationMessage = {
        agent: 'Agent C',
        message: agentCFinal,
        model: agentCModel,
        persona: agentCPersona
      };
      
      additionalMessages.push(agentCFinalMessage);
      if (onMessageReceived) await onMessageReceived(agentCFinalMessage);
    }
  }
  
  return [...conversation, ...additionalMessages];
};
