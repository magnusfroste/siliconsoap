
import { ScenarioType } from '../../../types';
import { getAgentSoapName } from '../../../utils/agentNameGenerator';

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
 * Generates agent name introductions for the prompts
 */
const getAgentIntro = (agentLetter: string, persona: string): string => {
  const soapName = getAgentSoapName(`Agent ${agentLetter}`, persona);
  return `You are ${soapName}. 

IMPORTANT NAME RULES:
- When introducing yourself, use "${soapName}" - NEVER say "Agent ${agentLetter}"
- Keep self-introductions brief or skip them entirely - the reader already knows who you are from the UI
- When referencing other participants, use their names (not "Agent A/B/C")

Speak and act as this character.`;
};

const getOtherAgentName = (agentLetter: string, persona: string): string => {
  return getAgentSoapName(`Agent ${agentLetter}`, persona);
};

/**
 * Generates the prompt for Agent A to start the conversation
 */
export const createAgentAInitialPrompt = (
  currentPrompt: string,
  currentScenario: ScenarioType,
  turnOrder: 'sequential' | 'random' | 'popcorn' = 'sequential',
  personaA: string = 'analytical'
): string => {
  const agentIntro = getAgentIntro('A', personaA);
  const basePrompt = currentScenario.promptTemplate(currentPrompt);
  
  if (turnOrder === 'popcorn') {
    return `${agentIntro}\n\n${basePrompt}\n\nNote: This is a dynamic conversation. You can address other agents directly by name to invite their perspectives.`;
  }
  
  return `${agentIntro}\n\n${basePrompt}`;
};

/**
 * Generates the prompt for Agent B to respond to Agent A
 */
export const createAgentBPrompt = (
  currentPrompt: string,
  agentAResponse: string,
  currentScenario: ScenarioType,
  turnOrder: 'sequential' | 'random' | 'popcorn' = 'sequential',
  personaA: string = 'analytical',
  personaB: string = 'creative'
): string => {
  const agentIntro = getAgentIntro('B', personaB);
  const agentAName = getOtherAgentName('A', personaA);
  
  return `
    ${agentIntro}
    
    ${currentScenario.id === 'text-analysis' ? `${agentAName} analyzed this original text: "${currentPrompt}"` : `We're discussing: "${currentPrompt}"`}
    
    ${agentAName}'s ${currentScenario.id === 'text-analysis' ? 'analysis' : 'response'} was: "${agentAResponse}"
    
    ${currentScenario.id === 'text-analysis' 
      ? `Based on both the original text and ${agentAName}'s analysis, who do you think wrote the text?` 
      : `What's your perspective on this topic? You can agree or disagree with ${agentAName}.`} 
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
  turnOrder: 'sequential' | 'random' | 'popcorn' = 'sequential',
  personaA: string = 'analytical',
  personaB: string = 'creative',
  personaC: string = 'strategic'
): string => {
  const agentIntro = getAgentIntro('C', personaC);
  const agentAName = getOtherAgentName('A', personaA);
  const agentBName = getOtherAgentName('B', personaB);
  
  return `
    ${agentIntro}
    
    ${currentScenario.id === 'text-analysis' ? `We're analyzing this original text: "${currentPrompt}"` : `We're discussing: "${currentPrompt}"`}
    
    ${agentAName}'s response was: "${agentAResponse}"
    
    ${agentBName}'s response was: "${agentBResponse}"
    
    Based on both responses and the original ${currentScenario.id === 'text-analysis' ? 'text' : 'topic'}, what is your perspective?
    You may agree or disagree with either ${agentAName} or ${agentBName}, or provide a completely different take.
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
  currentScenario: ScenarioType,
  personaA: string = 'analytical',
  personaB: string = 'creative',
  personaC: string = 'strategic'
): string => {
  const agentIntro = getAgentIntro('A', personaA);
  const agentBName = getOtherAgentName('B', personaB);
  const agentCName = getOtherAgentName('C', personaC);
  
  if (numberOfAgents === 2) {
    return `${agentIntro}\n\n${currentScenario.followupTemplate(
      currentPrompt,
      agentAResponse,
      agentBResponse
    )}`;
  } else {
    return `
      ${agentIntro}
      
      We're discussing ${currentScenario.id === 'text-analysis' ? `this text: "${currentPrompt}"` : `this topic: "${currentPrompt}"`}
      
      My initial response was: "${agentAResponse}"
      
      ${agentBName} responded: "${agentBResponse}"
      
      ${agentCName} responded: "${agentCResponse || ''}"
      
      How would you respond to both ${agentBName}'s and ${agentCName}'s perspectives? Do you agree with either of them or do you have additional insights?
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
  currentScenario: ScenarioType,
  personaA: string = 'analytical',
  personaB: string = 'creative',
  personaC: string = 'strategic'
): string => {
  const agentIntro = getAgentIntro('B', personaB);
  const agentAName = getOtherAgentName('A', personaA);
  const agentCName = getOtherAgentName('C', personaC);
  
  if (numberOfAgents === 2) {
    return `${agentIntro}\n\n${currentScenario.finalTemplate(
      currentPrompt,
      agentBResponse,
      agentAFollowup
    )}`;
  } else {
    return `
      ${agentIntro}
      
      We're discussing ${currentScenario.id === 'text-analysis' ? `this text: "${currentPrompt}"` : `this topic: "${currentPrompt}"`}
      
      My previous response was: "${agentBResponse}"
      
      ${agentAName} has responded with: "${agentAFollowup}"
      
      Considering all perspectives shared so far, what's your final assessment or conclusion?
      You may reference ${agentAName} or ${agentCName} by name.
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
  currentScenario: ScenarioType,
  personaA: string = 'analytical',
  personaB: string = 'creative',
  personaC: string = 'strategic'
): string => {
  const agentIntro = getAgentIntro('C', personaC);
  const agentAName = getOtherAgentName('A', personaA);
  const agentBName = getOtherAgentName('B', personaB);
  
  return `
    ${agentIntro}
    
    We're discussing ${currentScenario.id === 'text-analysis' ? `this text: "${currentPrompt}"` : `this topic: "${currentPrompt}"`}
    
    The conversation so far has included multiple perspectives.
    
    ${agentAName}'s latest response: "${agentAFollowup}"
    ${agentBName}'s latest response: "${agentBFinal}"
    
    What's your final assessment or conclusion on this topic? You may offer a synthesis of the ideas presented or a unique perspective.
    You may reference ${agentAName} or ${agentBName} by name.
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
  currentScenario: ScenarioType,
  persona: string = 'analytical'
): string => {
  const agentLetter = agentName.replace('Agent ', '');
  const soapName = getAgentSoapName(agentName, persona);
  
  // Get the last few messages for context (limit to avoid token bloat)
  const recentMessages = conversationHistory.slice(-6);
  const conversationContext = recentMessages
    .map(msg => {
      const msgSoapName = getAgentSoapName(msg.agent, msg.persona || 'analytical');
      return `${msgSoapName}: "${msg.message}"`;
    })
    .join('\n\n');

  return `
    You are ${soapName}. When introducing yourself, use "${soapName}" - never say "Agent ${agentLetter}". Keep self-introductions brief.
    
    We're having a discussion about: "${originalPrompt}"
    
    Here's the recent conversation:
    ${conversationContext}
    
    The user (a human participant in this conversation) just said: "${userMessage}"
    
    As ${soapName}, respond directly to the user's message. Acknowledge their input, share your perspective, and engage with their point.
    Stay true to your persona while being conversational and respectful of the human participant.
  `;
};
