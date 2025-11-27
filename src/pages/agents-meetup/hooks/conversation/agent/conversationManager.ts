import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { 
  isModelFree, 
  checkApiAvailability 
} from '@/utils/openRouter';
import { callOpenRouterViaEdge } from '@/utils/openRouter/api/completions';
import { ConversationMessage, ResponseLength, ScenarioType, TurnOrder } from '../../../types';
import {
  createAgentAInitialPrompt,
  createAgentBPrompt,
  createAgentCPrompt,
  createAgentAFollowupPrompt,
  createAgentBFinalPrompt,
  createAgentCFinalPrompt,
  createResponseToUserPrompt,
  LANGUAGE_INSTRUCTION
} from './agentPrompts';

/**
 * Wraps persona with language instruction
 */
const withLanguageInstruction = (persona: string): string => {
  return persona + LANGUAGE_INSTRUCTION;
};

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
 * Shuffles an array using Fisher-Yates algorithm
 */
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Selects the next agent to speak using AI (Popcorn mode)
 */
const selectNextAgent = async (
  conversationHistory: ConversationMessage[],
  availableAgents: Array<{ id: string; name: string; persona: string }>,
  apiKey: string,
  currentPrompt: string
): Promise<string> => {
  const recentMessages = conversationHistory.slice(-4);
  const conversationContext = recentMessages
    .map(msg => `${msg.agent} (${msg.persona}): "${msg.message.substring(0, 200)}..."`)
    .join('\n\n');

  const agentDescriptions = availableAgents
    .map(a => `- ${a.name}: ${a.persona}`)
    .join('\n');

  const prompt = `You are managing turn order in a multi-agent discussion about: "${currentPrompt}"

Recent conversation:
${conversationContext}

Available agents to speak next:
${agentDescriptions}

Who should speak next and why? Consider:
- Who was directly mentioned or addressed?
- Whose expertise is most relevant to the current topic?
- Who would provide a contrasting or complementary perspective?
- Natural conversation flow

Respond with ONLY the agent ID (A, B, or C) followed by a brief reason.
Format: "AGENT_ID: reason"

Example: "B: Their analytical expertise would help evaluate the ethical framework just proposed."`;

  try {
    const response = await callOpenRouterViaEdge(
      prompt,
      'anthropic/claude-3.5-sonnet', // Use a capable model for turn selection
      'You are a conversation coordinator who selects the most relevant speaker.',
      apiKey || null,
      'short'
    );

    // Parse response to extract agent ID
    const match = response.match(/^([ABC]):/i);
    if (match) {
      return `Agent ${match[1].toUpperCase()}`;
    }

    // Fallback: return first available agent
    return availableAgents[0].name;
  } catch (error) {
    console.error('Error selecting next agent:', error);
    // Fallback to random selection
    return availableAgents[Math.floor(Math.random() * availableAgents.length)].name;
  }
};

/**
 * Gets agent order for current round based on turn order mode
 */
const getAgentOrder = (
  turnOrder: TurnOrder,
  numberOfAgents: number,
  roundNumber: number
): string[] => {
  const agents = ['Agent A', 'Agent B', 'Agent C'].slice(0, numberOfAgents);
  
  if (turnOrder === 'random') {
    return shuffleArray(agents);
  }
  
  return agents; // Sequential order
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
  onMessageReceived?: (message: ConversationMessage) => Promise<void>,
  temperature?: number,
  turnOrder: TurnOrder = 'sequential'
): Promise<{
  conversationMessages: ConversationMessage[],
  agentAResponse: string,
  agentBResponse: string
}> => {
  const messages: ConversationMessage[] = [];
  
  // Get agent order for this round
  const agentOrder = turnOrder === 'popcorn' 
    ? ['Agent A', 'Agent B', 'Agent C'].slice(0, numberOfAgents) // Popcorn starts with all, then dynamically selects
    : getAgentOrder(turnOrder, numberOfAgents, 1);
  
  // Agent A always starts the conversation (or first in order)
  const agentAPrompt = createAgentAInitialPrompt(currentPrompt, currentScenario, turnOrder);
  
  const agentAResponse = await callOpenRouterViaEdge(
    agentAPrompt,
    agentAModel,
    withLanguageInstruction(agentAPersona),
    apiKey || null,
    responseLength,
    temperature
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
  
  // Determine next speaker (Agent B or AI-selected in Popcorn mode)
  let nextAgent = 'Agent B';
  if (turnOrder === 'popcorn' && numberOfAgents > 1) {
    const availableAgents = [
      { id: 'B', name: 'Agent B', persona: agentBPersona },
      ...(numberOfAgents === 3 ? [{ id: 'C', name: 'Agent C', persona: agentCPersona }] : [])
    ];
    nextAgent = await selectNextAgent(messages, availableAgents, apiKey, currentPrompt);
  }
  
  // Agent B response (or dynamically selected agent)
  const agentBPrompt = createAgentBPrompt(currentPrompt, agentAResponse, currentScenario, turnOrder);
  
  const agentBResponse = await callOpenRouterViaEdge(
    agentBPrompt,
    agentBModel,
    withLanguageInstruction(agentBPersona),
    apiKey || null,
    responseLength,
    temperature
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
    // Determine final speaker (Agent C or AI-selected in Popcorn mode)
    let finalAgent = 'Agent C';
    if (turnOrder === 'popcorn') {
      const availableAgents = [
        { id: 'A', name: 'Agent A', persona: agentAPersona },
        { id: 'C', name: 'Agent C', persona: agentCPersona }
      ].filter(a => !messages.slice(-1).some(m => m.agent === a.name)); // Exclude last speaker
      
      if (availableAgents.length > 0) {
        finalAgent = await selectNextAgent(messages, availableAgents, apiKey, currentPrompt);
      }
    }
    
    const agentCPrompt = createAgentCPrompt(currentPrompt, agentAResponse, agentBResponse, currentScenario, turnOrder);
    
    const agentCResponse = await callOpenRouterViaEdge(
      agentCPrompt,
      agentCModel,
      withLanguageInstruction(agentCPersona),
      apiKey || null,
      responseLength,
      temperature
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
  onMessageReceived?: (message: ConversationMessage) => Promise<void>,
  temperature?: number,
  turnOrder: TurnOrder = 'sequential'
): Promise<ConversationMessage[]> => {
  if (rounds <= 1) return conversation;
  
  const additionalMessages: ConversationMessage[] = [];
  
  // Get the latest Agent C response if it exists
  const latestAgentCResponse = conversation.find(c => c.agent === 'Agent C')?.message;
  
  // Get agent order for round 2
  const round2Order = getAgentOrder(turnOrder, numberOfAgents, 2);
  
  // Second round - First agent in order responds to previous responses
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
    withLanguageInstruction(agentAPersona),
    apiKey || null,
    responseLength,
    temperature
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
      withLanguageInstruction(agentBPersona),
      apiKey || null,
      responseLength,
      temperature
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
        withLanguageInstruction(agentCPersona),
        apiKey || null,
        responseLength,
        temperature
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

/**
 * Handles agents responding to a user's follow-up message
 */
export const handleUserFollowUp = async (
  originalPrompt: string,
  userMessage: string,
  currentConversation: ConversationMessage[],
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
  onMessageReceived?: (message: ConversationMessage) => Promise<void>,
  temperature?: number
): Promise<void> => {
  // Agent A responds to user
  const agentAPrompt = createResponseToUserPrompt(
    originalPrompt,
    userMessage,
    currentConversation,
    'Agent A',
    currentScenario
  );
  
  const agentAResponse = await callOpenRouterViaEdge(
    agentAPrompt,
    agentAModel,
    withLanguageInstruction(agentAPersona),
    apiKey || null,
    responseLength,
    temperature
  );
  
  const agentAMessage: ConversationMessage = {
    agent: 'Agent A',
    message: agentAResponse,
    model: agentAModel,
    persona: agentAPersona
  };
  
  if (onMessageReceived) await onMessageReceived(agentAMessage);
  
  // If only one agent, we're done
  if (numberOfAgents === 1) return;
  
  // Agent B responds to user
  const agentBPrompt = createResponseToUserPrompt(
    originalPrompt,
    userMessage,
    [...currentConversation, agentAMessage],
    'Agent B',
    currentScenario
  );
  
  const agentBResponse = await callOpenRouterViaEdge(
    agentBPrompt,
    agentBModel,
    withLanguageInstruction(agentBPersona),
    apiKey || null,
    responseLength,
    temperature
  );
  
  const agentBMessage: ConversationMessage = {
    agent: 'Agent B',
    message: agentBResponse,
    model: agentBModel,
    persona: agentBPersona
  };
  
  if (onMessageReceived) await onMessageReceived(agentBMessage);
  
  // If only two agents, we're done
  if (numberOfAgents === 2) return;
  
  // Agent C responds to user
  const agentCPrompt = createResponseToUserPrompt(
    originalPrompt,
    userMessage,
    [...currentConversation, agentAMessage, agentBMessage],
    'Agent C',
    currentScenario
  );
  
  const agentCResponse = await callOpenRouterViaEdge(
    agentCPrompt,
    agentCModel,
    withLanguageInstruction(agentCPersona),
    apiKey || null,
    responseLength,
    temperature
  );
  
  const agentCMessage: ConversationMessage = {
    agent: 'Agent C',
    message: agentCResponse,
    model: agentCModel,
    persona: agentCPersona
  };
  
  if (onMessageReceived) await onMessageReceived(agentCMessage);
};
