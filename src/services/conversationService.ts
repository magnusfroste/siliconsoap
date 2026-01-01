// Conversation Service - business logic for agent conversations
// Moved from hooks/conversation/agent/conversationManager.ts

import { toast } from '@/hooks/use-toast';
import { checkApiAvailability } from '@/utils/openRouter';
import { callOpenRouterWithUsage, CompletionResult } from '@/utils/openRouter/api/completions';
import { 
  ConversationMessage, 
  ResponseLength, 
  ScenarioType, 
  TurnOrder,
  TokenUsage
} from '@/models';
import {
  createAgentAInitialPrompt,
  createAgentBPrompt,
  createAgentCPrompt,
  createResponseToUserPrompt,
  LANGUAGE_INSTRUCTION,
  clearAgentNameCache,
  ExpertSettings
} from '@/pages/agents-meetup/hooks/conversation/agent/agentPrompts';

export type { ExpertSettings };
import { getAgentSoapName } from '@/pages/agents-meetup/utils/agentNameGenerator';
import { tokenService } from './tokenService';
import { getCuratedModelById } from '@/repositories/curatedModelsRepository';

// Callback for tracking token usage
export type TokenUsageCallback = (usage: TokenUsage, modelId: string) => Promise<void>;

/**
 * Wraps persona with language instruction
 */
const withLanguageInstruction = (persona: string): string => {
  return persona + LANGUAGE_INSTRUCTION;
};

/**
 * Calculates token cost based on model pricing
 */
const calculateTokenCost = async (
  modelId: string,
  promptTokens: number,
  completionTokens: number
): Promise<number> => {
  const model = await getCuratedModelById(modelId);
  if (!model || !model.price_input || !model.price_output) {
    // Default to a small cost if model pricing not found
    return 0;
  }
  return tokenService.calculateCost(
    modelId,
    promptTokens,
    completionTokens,
    Number(model.price_input),
    Number(model.price_output)
  );
};

/**
 * Result from an agent call including content and fallback info
 */
export interface AgentCallResult {
  content: string;
  fallbackUsed?: boolean;
  originalModel?: string;
}

/**
 * Makes an API call and optionally logs token usage
 */
const callWithTokenTracking = async (
  prompt: string,
  model: string,
  persona: string,
  apiKey: string | null,
  responseLength: ResponseLength,
  temperature: number | undefined,
  onTokenUsage?: TokenUsageCallback
): Promise<AgentCallResult> => {
  const result = await callOpenRouterWithUsage(
    prompt,
    model,
    persona,
    apiKey,
    responseLength,
    temperature ?? 0.7
  );

  // Log token usage if callback provided and we have usage data
  if (onTokenUsage && result.usage) {
    // Use cost from OpenRouter if available, otherwise calculate locally
    const actualModel = result.model || model;
    const cost = result.usage.cost ?? await calculateTokenCost(
      actualModel,
      result.usage.prompt_tokens,
      result.usage.completion_tokens
    );
    
    const tokenUsage: TokenUsage = {
      prompt_tokens: result.usage.prompt_tokens,
      completion_tokens: result.usage.completion_tokens,
      total_tokens: result.usage.total_tokens,
      estimated_cost: cost
    };
    
    // Use the actual model returned by OpenRouter (handles fallbacks correctly)
    await onTokenUsage(tokenUsage, actualModel);
    
    console.log(`[TokenTracking] Model: ${actualModel}, Tokens: ${result.usage.total_tokens}, Cost: $${cost.toFixed(6)}${result.fallbackUsed ? ` (fallback from ${model})` : ''}`);
  }

  return {
    content: result.content,
    fallbackUsed: result.fallbackUsed,
    originalModel: result.originalModel
  };
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
 * Checks if user has sufficient token budget before starting
 */
export const checkTokenBudget = async (
  userId: string | null,
  estimatedTokens: number = 10000
): Promise<{ canStart: boolean; budgetRemaining: number }> => {
  const state = await tokenService.loadTokenState(userId);
  const canStart = tokenService.canStartConversation(state.budgetRemaining, estimatedTokens);
  
  if (!canStart) {
    toast({
      title: "Insufficient Token Budget",
      description: `You need approximately ${tokenService.formatTokens(estimatedTokens)} tokens for this conversation. You have ${tokenService.formatTokens(state.budgetRemaining)} remaining.`,
      variant: "destructive",
      duration: 5000,
    });
  }
  
  return { canStart, budgetRemaining: state.budgetRemaining };
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
  currentPrompt: string,
  onTokenUsage?: TokenUsageCallback
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
    const response = await callWithTokenTracking(
      prompt,
      'anthropic/claude-3.5-sonnet',
      'You are a conversation coordinator who selects the most relevant speaker.',
      apiKey || null,
      'short',
      undefined,
      onTokenUsage
    );

    const match = response.content.match(/^([ABC]):/i);
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
 * Tone instructions for expert settings
 */
const toneInstructions: Record<string, string> = {
  formal: "Engage formally and professionally, citing evidence and maintaining academic rigor.",
  casual: "Be conversational and friendly, use everyday language and examples.",
  heated: "Be passionate and assertive about your position, challenge other viewpoints directly.",
  collaborative: "Focus on building on others' ideas, find common ground, and synthesize perspectives."
};

/**
 * Agreement bias instructions for expert settings
 */
const getAgreementInstruction = (bias: number): string => {
  if (bias < 30) return "Challenge and critically examine other perspectives. Play devil's advocate.";
  if (bias > 70) return "Look for areas of agreement. Build on and expand other agents' ideas.";
  return "Balance agreement and disagreement naturally based on the merits of arguments.";
};

/**
 * Personality intensity modifiers for expert settings
 */
const intensityModifiers: Record<string, string> = {
  mild: "Express your persona subtly, focusing primarily on the content.",
  moderate: "Let your persona characteristics come through clearly in your responses.",
  extreme: "Strongly embody your persona with distinctive voice, opinions, and style."
};

/**
 * Generates expert settings instructions for continuation prompts
 */
const getExpertInstructionsForContinuation = (settings?: ExpertSettings): string => {
  if (!settings) return '';
  
  const toneInstruction = toneInstructions[settings.conversationTone] || toneInstructions.collaborative;
  const agreementInstruction = getAgreementInstruction(settings.agreementBias);
  const intensityInstruction = intensityModifiers[settings.personalityIntensity] || intensityModifiers.moderate;
  
  return `\n\nCONVERSATION STYLE INSTRUCTIONS:
- Tone: ${toneInstruction}
- Stance: ${agreementInstruction}
- Expression: ${intensityInstruction}`;
};

/**
 * Creates a continuation prompt for an agent in later rounds
 */
const createContinuationPrompt = (
  originalPrompt: string,
  conversationHistory: ConversationMessage[],
  agentName: string,
  agentPersona: string,
  currentRound: number,
  totalRounds: number,
  scenario: ScenarioType,
  expertSettings?: ExpertSettings
): string => {
  const isLastRound = currentRound === totalRounds;
  const soapName = getAgentSoapName(agentName, agentPersona);
  const agentLetter = agentName.replace('Agent ', '');
  const expertInstructions = getExpertInstructionsForContinuation(expertSettings);
  
  // Format conversation history with soap opera names
  const formattedHistory = conversationHistory
    .map(m => {
      if (m.isHuman) return `User: ${m.message}`;
      const msgSoapName = getAgentSoapName(m.agent, m.persona || 'analytical');
      return `${msgSoapName}: ${m.message}`;
    })
    .join('\n\n');
  
  return `You are ${soapName} (Agent ${agentLetter}). Speak and act as this character.${expertInstructions}

You are participating in a multi-agent discussion about: "${originalPrompt}"

This is a ${scenario.name} discussion.

Here is the conversation so far:
${formattedHistory}

This is round ${currentRound} of ${totalRounds}.
${isLastRound ? 'This is the FINAL round - try to synthesize key insights and provide concluding thoughts.' : 'Continue the discussion by building on previous points, offering new perspectives, or respectfully challenging ideas.'}

Respond naturally as ${soapName}, staying in character with your assigned persona. Keep your response focused and substantive.`;
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
  turnOrder: TurnOrder = 'sequential',
  onTokenUsage?: TokenUsageCallback,
  expertSettings?: ExpertSettings
): Promise<{
  conversationMessages: ConversationMessage[],
  agentAResponse: string,
  agentBResponse: string
}> => {
  // Clear name cache at start of new conversation to ensure unique names
  clearAgentNameCache();
  
  const messages: ConversationMessage[] = [];
  
  const agentOrder = turnOrder === 'popcorn' 
    ? ['Agent A', 'Agent B', 'Agent C'].slice(0, numberOfAgents)
    : getAgentOrder(turnOrder, numberOfAgents, 1);
  
  // Agent A always starts
  const agentAPrompt = createAgentAInitialPrompt(currentPrompt, currentScenario, turnOrder, agentAPersona, expertSettings);
  
  const agentAResponse = await callWithTokenTracking(
    agentAPrompt,
    agentAModel,
    withLanguageInstruction(agentAPersona),
    apiKey || null,
    responseLength,
    temperature,
    onTokenUsage
  );
  
  const agentAMessage: ConversationMessage = {
    agent: 'Agent A',
    message: agentAResponse.content,
    model: agentAModel,
    persona: agentAPersona,
    fallbackUsed: agentAResponse.fallbackUsed,
    originalModel: agentAResponse.originalModel
  };
  
  messages.push(agentAMessage);
  if (onMessageReceived) await onMessageReceived(agentAMessage);
  
  if (numberOfAgents === 1) {
    return { conversationMessages: messages, agentAResponse: agentAResponse.content, agentBResponse: '' };
  }
  
  // Agent B response
  let nextAgent = 'Agent B';
  if (turnOrder === 'popcorn' && numberOfAgents > 1) {
    const availableAgents = [
      { id: 'B', name: 'Agent B', persona: agentBPersona },
      ...(numberOfAgents === 3 ? [{ id: 'C', name: 'Agent C', persona: agentCPersona }] : [])
    ];
    nextAgent = await selectNextAgent(messages, availableAgents, apiKey, currentPrompt, onTokenUsage);
  }
  
  const agentBPrompt = createAgentBPrompt(currentPrompt, agentAResponse.content, currentScenario, turnOrder, agentAPersona, agentBPersona, expertSettings);
  
  const agentBResponse = await callWithTokenTracking(
    agentBPrompt,
    agentBModel,
    withLanguageInstruction(agentBPersona),
    apiKey || null,
    responseLength,
    temperature,
    onTokenUsage
  );
  
  const agentBMessage: ConversationMessage = {
    agent: 'Agent B',
    message: agentBResponse.content,
    model: agentBModel,
    persona: agentBPersona,
    fallbackUsed: agentBResponse.fallbackUsed,
    originalModel: agentBResponse.originalModel
  };
  
  messages.push(agentBMessage);
  if (onMessageReceived) await onMessageReceived(agentBMessage);
  
  if (numberOfAgents === 2) {
    return { conversationMessages: messages, agentAResponse: agentAResponse.content, agentBResponse: agentBResponse.content };
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
        finalAgent = await selectNextAgent(messages, availableAgents, apiKey, currentPrompt, onTokenUsage);
      }
    }
    
    const agentCPrompt = createAgentCPrompt(currentPrompt, agentAResponse.content, agentBResponse.content, currentScenario, turnOrder, agentAPersona, agentBPersona, agentCPersona, expertSettings);
    
    const agentCResponse = await callWithTokenTracking(
      agentCPrompt,
      agentCModel,
      withLanguageInstruction(agentCPersona),
      apiKey || null,
      responseLength,
      temperature,
      onTokenUsage
    );
    
    const agentCMessage: ConversationMessage = {
      agent: 'Agent C',
      message: agentCResponse.content,
      model: agentCModel,
      persona: agentCPersona,
      fallbackUsed: agentCResponse.fallbackUsed,
      originalModel: agentCResponse.originalModel
    };
    
    messages.push(agentCMessage);
    if (onMessageReceived) await onMessageReceived(agentCMessage);
  }
  
  return { conversationMessages: messages, agentAResponse: agentAResponse.content, agentBResponse: agentBResponse.content };
};

/**
 * Handles a single round of conversation between agents (for round-by-round mode)
 */
export const handleSingleRound = async (
  currentPrompt: string,
  currentScenario: ScenarioType,
  roundNumber: number,
  totalRounds: number,
  numberOfAgents: number,
  agentAModel: string,
  agentBModel: string,
  agentCModel: string,
  agentAPersona: string,
  agentBPersona: string,
  agentCPersona: string,
  conversation: ConversationMessage[],
  apiKey: string,
  responseLength: ResponseLength,
  onMessageReceived?: (message: ConversationMessage) => Promise<void>,
  temperature?: number,
  turnOrder: TurnOrder = 'sequential',
  onTokenUsage?: TokenUsageCallback,
  expertSettings?: ExpertSettings
): Promise<ConversationMessage[]> => {
  const allMessages: ConversationMessage[] = [...conversation];
  
  const agentConfigs = [
    { name: 'Agent A', model: agentAModel, persona: agentAPersona },
    { name: 'Agent B', model: agentBModel, persona: agentBPersona },
    { name: 'Agent C', model: agentCModel, persona: agentCPersona },
  ].slice(0, numberOfAgents);
  
  console.log(`[conversationService] Running single round ${roundNumber} of ${totalRounds}`);
  
  const agentOrder = getAgentOrder(turnOrder, numberOfAgents, roundNumber);
  
  for (const agentName of agentOrder) {
    const agentConfig = agentConfigs.find(a => a.name === agentName);
    if (!agentConfig) continue;
    
    const continuationPrompt = createContinuationPrompt(
      currentPrompt,
      allMessages,
      agentConfig.name,
      agentConfig.persona,
      roundNumber,
      totalRounds,
      currentScenario,
      expertSettings
    );
    
    const response = await callWithTokenTracking(
      continuationPrompt,
      agentConfig.model,
      withLanguageInstruction(agentConfig.persona),
      apiKey || null,
      responseLength,
      temperature,
      onTokenUsage
    );
    
    const message: ConversationMessage = {
      agent: agentConfig.name,
      message: response.content,
      model: agentConfig.model,
      persona: agentConfig.persona,
      fallbackUsed: response.fallbackUsed,
      originalModel: response.originalModel
    };
    
    allMessages.push(message);
    if (onMessageReceived) await onMessageReceived(message);
  }
  
  console.log(`[conversationService] Completed round ${roundNumber}, total messages: ${allMessages.length}`);
  return allMessages;
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
  turnOrder: TurnOrder = 'sequential',
  onTokenUsage?: TokenUsageCallback,
  expertSettings?: ExpertSettings
): Promise<ConversationMessage[]> => {
  if (rounds <= 1) return conversation;
  
  const agentConfigs = [
    { name: 'Agent A', model: agentAModel, persona: agentAPersona },
    { name: 'Agent B', model: agentBModel, persona: agentBPersona },
    { name: 'Agent C', model: agentCModel, persona: agentCPersona },
  ].slice(0, numberOfAgents);
  
  let allMessages: ConversationMessage[] = [...conversation];
  
  for (let roundNum = 2; roundNum <= rounds; roundNum++) {
    console.log(`[conversationService] Starting round ${roundNum} of ${rounds}`);
    
    const agentOrder = getAgentOrder(turnOrder, numberOfAgents, roundNum);
    
    for (const agentName of agentOrder) {
      const agentConfig = agentConfigs.find(a => a.name === agentName);
      if (!agentConfig) continue;
      
      const continuationPrompt = createContinuationPrompt(
        currentPrompt,
        allMessages,
        agentConfig.name,
        agentConfig.persona,
        roundNum,
        rounds,
        currentScenario,
        expertSettings
      );
      
      const response = await callWithTokenTracking(
        continuationPrompt,
        agentConfig.model,
        withLanguageInstruction(agentConfig.persona),
        apiKey || null,
        responseLength,
        temperature,
        onTokenUsage
      );
      
      const message: ConversationMessage = {
        agent: agentConfig.name,
        message: response.content,
        model: agentConfig.model,
        persona: agentConfig.persona,
        fallbackUsed: response.fallbackUsed,
        originalModel: response.originalModel
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
  temperature?: number,
  onTokenUsage?: TokenUsageCallback
): Promise<void> => {
  // Agent A responds
  const agentAPrompt = createResponseToUserPrompt(
    originalPrompt,
    userMessage,
    currentConversation,
    'Agent A',
    currentScenario,
    agentAPersona
  );
  
  const agentAResponse = await callWithTokenTracking(
    agentAPrompt,
    agentAModel,
    withLanguageInstruction(agentAPersona),
    apiKey || null,
    responseLength,
    temperature,
    onTokenUsage
  );
  
  const agentAMessage: ConversationMessage = {
    agent: 'Agent A',
    message: agentAResponse.content,
    model: agentAModel,
    persona: agentAPersona,
    fallbackUsed: agentAResponse.fallbackUsed,
    originalModel: agentAResponse.originalModel
  };
  
  if (onMessageReceived) await onMessageReceived(agentAMessage);
  
  if (numberOfAgents === 1) return;
  
  // Agent B responds
  const agentBPrompt = createResponseToUserPrompt(
    originalPrompt,
    userMessage,
    [...currentConversation, agentAMessage],
    'Agent B',
    currentScenario,
    agentBPersona
  );
  
  const agentBResponse = await callWithTokenTracking(
    agentBPrompt,
    agentBModel,
    withLanguageInstruction(agentBPersona),
    apiKey || null,
    responseLength,
    temperature,
    onTokenUsage
  );
  
  const agentBMessage: ConversationMessage = {
    agent: 'Agent B',
    message: agentBResponse.content,
    model: agentBModel,
    persona: agentBPersona,
    fallbackUsed: agentBResponse.fallbackUsed,
    originalModel: agentBResponse.originalModel
  };
  
  if (onMessageReceived) await onMessageReceived(agentBMessage);
  
  if (numberOfAgents === 2) return;
  
  // Agent C responds
  const agentCPrompt = createResponseToUserPrompt(
    originalPrompt,
    userMessage,
    [...currentConversation, agentAMessage, agentBMessage],
    'Agent C',
    currentScenario,
    agentCPersona
  );
  
  const agentCResponse = await callWithTokenTracking(
    agentCPrompt,
    agentCModel,
    withLanguageInstruction(agentCPersona),
    apiKey || null,
    responseLength,
    temperature,
    onTokenUsage
  );
  
  const agentCMessage: ConversationMessage = {
    agent: 'Agent C',
    message: agentCResponse.content,
    model: agentCModel,
    persona: agentCPersona,
    fallbackUsed: agentCResponse.fallbackUsed,
    originalModel: agentCResponse.originalModel
  };
  
  if (onMessageReceived) await onMessageReceived(agentCMessage);
};
