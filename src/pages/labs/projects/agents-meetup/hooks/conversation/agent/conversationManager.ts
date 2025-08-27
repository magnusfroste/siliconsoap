import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { 
  callOpenRouter, 
  isModelFree, 
  checkApiAvailability 
} from '@/utils/openRouter';
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
 * Checks API availability before starting a conversation
 */
export const checkBeforeStarting = async (
  apiKey: string
): Promise<boolean> => {
  // If we have no API key, fail immediately
  if (!apiKey) {
    toast({
      title: "API Key Required",
      description: "No API key available. Please add your OpenRouter API key.",
      variant: "destructive",
    });
    return false;
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
  apiKey: string,
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
  
  if (!apiKey) {
    toast({
      title: "API Key Required",
      description: "Please enter your OpenRouter API key.",
      variant: "destructive",
    });
    return false;
  }
  
  // With BYOK approach, we don't need to check if models are free or not
  // since the user is always providing their own API key
  
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
  responseLength: ResponseLength
): Promise<{
  conversationMessages: ConversationMessage[],
  agentAResponse: string,
  agentBResponse: string
}> => {
  const messages: ConversationMessage[] = [];
  
  // Agent A always starts the conversation
  const agentAPrompt = createAgentAInitialPrompt(currentPrompt, currentScenario);
  
  const agentAResponse = await callOpenRouter(
    agentAPrompt,
    agentAModel,
    agentAPersona,
    apiKey,
    responseLength
  );
  
  messages.push({
    agent: 'Agent A',
    message: agentAResponse,
    model: agentAModel,
    persona: agentAPersona
  });
  
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
  
  const agentBResponse = await callOpenRouter(
    agentBPrompt,
    agentBModel,
    agentBPersona,
    apiKey,
    responseLength
  );
  
  messages.push({
    agent: 'Agent B',
    message: agentBResponse,
    model: agentBModel,
    persona: agentBPersona
  });
  
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
    
    const agentCResponse = await callOpenRouter(
      agentCPrompt,
      agentCModel,
      agentCPersona,
      apiKey,
      responseLength
    );
    
    messages.push({
      agent: 'Agent C',
      message: agentCResponse,
      model: agentCModel,
      persona: agentCPersona
    });
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
  responseLength: ResponseLength
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
  
  const agentAFollowup = await callOpenRouter(
    agentAFollowupPrompt,
    agentAModel,
    agentAPersona,
    apiKey,
    responseLength
  );
  
  additionalMessages.push({
    agent: 'Agent A',
    message: agentAFollowup,
    model: agentAModel,
    persona: agentAPersona
  });
  
  if (rounds > 2 || (rounds === 2 && numberOfAgents === 3)) {
    // Final responses for third round
    const agentBFinalPrompt = createAgentBFinalPrompt(
      currentPrompt,
      agentBResponse,
      agentAFollowup,
      numberOfAgents,
      currentScenario
    );
    
    const agentBFinal = await callOpenRouter(
      agentBFinalPrompt,
      agentBModel,
      agentBPersona,
      apiKey,
      responseLength
    );
    
    additionalMessages.push({
      agent: 'Agent B',
      message: agentBFinal,
      model: agentBModel,
      persona: agentBPersona
    });
    
    // Only for 3 agents, add final Agent C response
    if (numberOfAgents === 3 && rounds === 3) {
      const agentCFinalPrompt = createAgentCFinalPrompt(
        currentPrompt,
        agentAFollowup,
        agentBFinal,
        currentScenario
      );
      
      const agentCFinal = await callOpenRouter(
        agentCFinalPrompt,
        agentCModel,
        agentCPersona,
        apiKey,
        responseLength
      );
      
      additionalMessages.push({
        agent: 'Agent C',
        message: agentCFinal,
        model: agentCModel,
        persona: agentCPersona
      });
    }
  }
  
  return [...conversation, ...additionalMessages];
};
