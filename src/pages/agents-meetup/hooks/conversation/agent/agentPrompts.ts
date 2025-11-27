
import { ScenarioType } from '../../../types';

// Language instruction for all agents
export const LANGUAGE_INSTRUCTION = `

IMPORTANT: Respond in the same language as the user's question/prompt. If the language cannot be detected, default to English.`;

// Tone instructions for expert settings
const toneInstructions = {
  formal: "Engage formally and professionally, citing evidence and maintaining academic rigor.",
  casual: "Be conversational and friendly, use everyday language and examples.",
  heated: "Be passionate and assertive about your position, challenge other viewpoints directly.",
  collaborative: "Focus on building on others' ideas, find common ground, and synthesize perspectives."
};

// Agreement bias instructions for expert settings
const getAgreementInstruction = (bias: number) => {
  if (bias < 30) return "Challenge and critically examine other perspectives. Play devil's advocate.";
  if (bias > 70) return "Look for areas of agreement. Build on and expand other agents' ideas.";
  return "Balance agreement and disagreement naturally based on the merits of arguments.";
};

// Personality intensity modifiers for expert settings
const intensityModifiers = {
  mild: "Express your persona subtly, focusing primarily on the content.",
  moderate: "Let your persona characteristics come through clearly in your responses.",
  extreme: "Strongly embody your persona with distinctive voice, opinions, and style."
};

/**
 * Generates the prompt for Agent A to start the conversation
 */
export const createAgentAInitialPrompt = (
  currentPrompt: string,
  currentScenario: ScenarioType,
  turnOrder: 'sequential' | 'random' | 'popcorn' = 'sequential'
): string => {
  const basePrompt = currentScenario.promptTemplate(currentPrompt);
  
  if (turnOrder === 'popcorn') {
    return `${basePrompt}\n\nNote: This is a dynamic conversation. You can address other agents directly by name to invite their perspectives.`;
  }
  
  return basePrompt;
};

/**
 * Generates the prompt for Agent B to respond to Agent A
 */
export const createAgentBPrompt = (
  currentPrompt: string,
  agentAResponse: string,
  currentScenario: ScenarioType,
  turnOrder: 'sequential' | 'random' | 'popcorn' = 'sequential'
): string => {
  return `
    ${currentScenario.id === 'text-analysis' ? `Agent A analyzed this original text: "${currentPrompt}"` : `We're discussing: "${currentPrompt}"`}
    
    Agent A's ${currentScenario.id === 'text-analysis' ? 'analysis' : 'response'} was: "${agentAResponse}"
    
    ${currentScenario.id === 'text-analysis' 
      ? `Based on both the original text and Agent A's analysis, who do you think wrote the text?` 
      : `What's your perspective on this topic? You can agree or disagree with Agent A.`} 
    Provide your own perspective.
  `;
};

/**
 * Generates the prompt for Agent C to respond to Agents A and B
 */
export const createAgentCPrompt = (
  currentPrompt: string,
  agentAResponse: string,
  agentBResponse: string,
  currentScenario: ScenarioType,
  turnOrder: 'sequential' | 'random' | 'popcorn' = 'sequential'
): string => {
  return `
    ${currentScenario.id === 'text-analysis' ? `We're analyzing this original text: "${currentPrompt}"` : `We're discussing: "${currentPrompt}"`}
    
    Agent A's response was: "${agentAResponse}"
    
    Agent B's response was: "${agentBResponse}"
    
    Based on both responses and the original ${currentScenario.id === 'text-analysis' ? 'text' : 'topic'}, what is your perspective?
    You may agree or disagree with either agent, or provide a completely different take.
  `;
};

/**
 * Generates the follow-up prompt for Agent A after initial responses
 */
export const createAgentAFollowupPrompt = (
  currentPrompt: string,
  agentAResponse: string,
  agentBResponse: string,
  agentCResponse: string | undefined,
  numberOfAgents: number,
  currentScenario: ScenarioType
): string => {
  if (numberOfAgents === 2) {
    return currentScenario.followupTemplate(
      currentPrompt,
      agentAResponse,
      agentBResponse
    );
  } else {
    return `
      We're discussing ${currentScenario.id === 'text-analysis' ? `this text: "${currentPrompt}"` : `this topic: "${currentPrompt}"`}
      
      My initial response was: "${agentAResponse}"
      
      Agent B responded: "${agentBResponse}"
      
      Agent C responded: "${agentCResponse || ''}"
      
      How would you respond to both agents' perspectives? Do you agree with either of them or do you have additional insights? 
      Remember that you are Agent A - refer to the other agents as Agent B and Agent C.
    `;
  }
};

/**
 * Generates the final prompt for Agent B after Agent A's follow-up
 */
export const createAgentBFinalPrompt = (
  currentPrompt: string,
  agentBResponse: string,
  agentAFollowup: string,
  numberOfAgents: number,
  currentScenario: ScenarioType
): string => {
  if (numberOfAgents === 2) {
    return currentScenario.finalTemplate(
      currentPrompt,
      agentBResponse,
      agentAFollowup
    );
  } else {
    return `
      We're discussing ${currentScenario.id === 'text-analysis' ? `this text: "${currentPrompt}"` : `this topic: "${currentPrompt}"`}
      
      My previous response was: "${agentBResponse}"
      
      Agent A has responded with: "${agentAFollowup}"
      
      Considering all perspectives shared so far, what's your final assessment or conclusion?
      Remember that you are Agent B - refer to the other agents as Agent A and Agent C.
    `;
  }
};

/**
 * Generates the final prompt for Agent C after Agent A and B's latest responses
 */
export const createAgentCFinalPrompt = (
  currentPrompt: string,
  agentAFollowup: string,
  agentBFinal: string,
  currentScenario: ScenarioType
): string => {
  return `
    We're discussing ${currentScenario.id === 'text-analysis' ? `this text: "${currentPrompt}"` : `this topic: "${currentPrompt}"`}
    
    The conversation so far has included multiple perspectives.
    
    Agent A's latest response: "${agentAFollowup}"
    Agent B's latest response: "${agentBFinal}"
    
    What's your final assessment or conclusion on this topic? You may offer a synthesis of the ideas presented or a unique perspective.
    Remember that you are Agent C - refer to the other agents as Agent A and Agent B.
  `;
};

/**
 * Generates a prompt for an agent to respond to a user's message
 */
export const createResponseToUserPrompt = (
  originalPrompt: string,
  userMessage: string,
  conversationHistory: any[],
  agentName: string,
  currentScenario: ScenarioType
): string => {
  // Get the last few messages for context (limit to avoid token bloat)
  const recentMessages = conversationHistory.slice(-6);
  const conversationContext = recentMessages
    .map(msg => `${msg.agent}: "${msg.message}"`)
    .join('\n\n');

  return `
    We're having a discussion about: "${originalPrompt}"
    
    Here's the recent conversation:
    ${conversationContext}
    
    The user (a human participant in this conversation) just said: "${userMessage}"
    
    As ${agentName}, respond directly to the user's message. Acknowledge their input, share your perspective, and engage with their point.
    Stay true to your persona while being conversational and respectful of the human participant.
    
    Remember: You are ${agentName} speaking to a human who has joined the conversation.
  `;
};
