// Conversation Service - business logic for agent conversations
// Moved from hooks/conversation/agent/conversationManager.ts

import { toast } from '@/hooks/use-toast';
import { checkApiAvailability } from '@/utils/openRouter';
import { callOpenRouterViaEdge } from '@/utils/openRouter/api/completions';
import { 
  ConversationMessage, 
  ResponseLength, 
  ScenarioType, 
  TurnOrder 
} from '@/models';
import {
  createAgentAInitialPrompt,
  createAgentBPrompt,
  createAgentCPrompt,
  createResponseToUserPrompt,
  LANGUAGE_INSTRUCTION
} from '@/pages/agents-meetup/hooks/conversation/agent/agentPrompts';

/**
 * Wraps persona with language instruction
 */
const withLanguageInstruction = (persona: string): string => {
  return persona + LANGUAGE_INSTRUCTION;
};

/**
 * Checks API availability before starting a conversation
 */
export const checkBeforeStarting = async (
  apiKey: string | null
): Promise<boolean> => {
  if (!apiKey) {
    console.log("No user API key - will use shared key via edge function");
    return true;
  }

  console.log("Checking API availability before starting conversation");
  
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
Format: "AGENT_ID: reason"`;

  try {
    const response = await callOpenRouterViaEdge(
      prompt,
      'anthropic/claude-3.5-sonnet',
      'You are a conversation coordinator who selects the most relevant speaker.',
      apiKey || null,
      'short'
    );

    const match = response.match(/^([ABC]):/i);
    if (match) {
      return `Agent ${match[1].toUpperCase()}`;
    }
    return availableAgents[0].name;
  } catch (error) {
    console.error('Error selecting next agent:', error);
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
  
  return agents;
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
  
  return true;
};

/**
 * Creates a continuation prompt for an agent in later rounds
 */
const createContinuationPrompt = (
  originalPrompt: string,
  conversationHistory: string,
  agentName: string,
  currentRound: number,
  totalRounds: number,
  scenario: ScenarioType
): string => {
  const isLastRound = currentRound === totalRounds;
  
  return `You are participating in a multi-agent discussion about: "${originalPrompt}"

This is a ${scenario.name} discussion.

Here is the conversation so far:
${conversationHistory}

You are ${agentName}. This is round ${currentRound} of ${totalRounds}.
${isLastRound ? 'This is the FINAL round - try to synthesize key insights and provide concluding thoughts.' : 'Continue the discussion by building on previous points, offering new perspectives, or respectfully challenging ideas.'}

Respond naturally as ${agentName}, staying in character with your assigned persona. Keep your response focused and substantive.`;
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
  
  const agentOrder = turnOrder === 'popcorn' 
    ? ['Agent A', 'Agent B', 'Agent C'].slice(0, numberOfAgents)
    : getAgentOrder(turnOrder, numberOfAgents, 1);
  
  // Agent A always starts
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
  
  if (numberOfAgents === 1) {
    return { conversationMessages: messages, agentAResponse, agentBResponse: '' };
  }
  
  // Agent B response
  let nextAgent = 'Agent B';
  if (turnOrder === 'popcorn' && numberOfAgents > 1) {
    const availableAgents = [
      { id: 'B', name: 'Agent B', persona: agentBPersona },
      ...(numberOfAgents === 3 ? [{ id: 'C', name: 'Agent C', persona: agentCPersona }] : [])
    ];
    nextAgent = await selectNextAgent(messages, availableAgents, apiKey, currentPrompt);
  }
  
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
  
  if (numberOfAgents === 2) {
    return { conversationMessages: messages, agentAResponse, agentBResponse };
  }
  
  // Agent C response
  if (numberOfAgents === 3) {
    let finalAgent = 'Agent C';
    if (turnOrder === 'popcorn') {
      const availableAgents = [
        { id: 'A', name: 'Agent A', persona: agentAPersona },
        { id: 'C', name: 'Agent C', persona: agentCPersona }
      ].filter(a => !messages.slice(-1).some(m => m.agent === a.name));
      
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
  
  return { conversationMessages: messages, agentAResponse, agentBResponse };
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
  
  const allMessages: ConversationMessage[] = [...conversation];
  
  const agentConfigs = [
    { name: 'Agent A', model: agentAModel, persona: agentAPersona },
    { name: 'Agent B', model: agentBModel, persona: agentBPersona },
    { name: 'Agent C', model: agentCModel, persona: agentCPersona },
  ].slice(0, numberOfAgents);
  
  for (let roundNum = 2; roundNum <= rounds; roundNum++) {
    console.log(`[conversationService] Starting round ${roundNum} of ${rounds}`);
    
    const agentOrder = getAgentOrder(turnOrder, numberOfAgents, roundNum);
    
    for (const agentName of agentOrder) {
      const agentConfig = agentConfigs.find(a => a.name === agentName);
      if (!agentConfig) continue;
      
      const conversationHistory = allMessages
        .map(m => `${m.agent}: ${m.message}`)
        .join('\n\n');
      
      const continuationPrompt = createContinuationPrompt(
        currentPrompt,
        conversationHistory,
        agentConfig.name,
        roundNum,
        rounds,
        currentScenario
      );
      
      const response = await callOpenRouterViaEdge(
        continuationPrompt,
        agentConfig.model,
        withLanguageInstruction(agentConfig.persona),
        apiKey || null,
        responseLength,
        temperature
      );
      
      const message: ConversationMessage = {
        agent: agentConfig.name,
        message: response,
        model: agentConfig.model,
        persona: agentConfig.persona
      };
      
      allMessages.push(message);
      if (onMessageReceived) await onMessageReceived(message);
    }
  }
  
  console.log(`[conversationService] Completed all ${rounds} rounds, total messages: ${allMessages.length}`);
  return allMessages;
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
  // Agent A responds
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
  
  if (numberOfAgents === 1) return;
  
  // Agent B responds
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
  
  if (numberOfAgents === 2) return;
  
  // Agent C responds
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
