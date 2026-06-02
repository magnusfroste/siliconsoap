
import { ScenarioType } from '../../../types';
import { getAgentSoapName, setActiveAgentName, clearActiveAgentNames } from '../../../utils/agentNameGenerator';

// Expert settings type for prompt generation
export interface ExpertSettings {
  conversationTone: 'formal' | 'casual' | 'heated' | 'collaborative';
  agreementBias: number;
  personalityIntensity: 'mild' | 'moderate' | 'extreme';
}

// Language instruction for all agents
export const LANGUAGE_INSTRUCTION = `

IMPORTANT: Respond in the same language as the user's question/prompt. If the language cannot be detected, default to English.

NAMING RULE (strict): Never refer to other participants as "Agent A", "Agent B" or "Agent C". Always address them by the real first name shown earlier in the conversation. Do not invent the label "Agent X" anywhere in your reply.`;

// Inner monologue / scratchpad instruction (Hermes / Nous-style).
// When prepended to an agent prompt, the model first reasons privately
// inside <thinking>...</thinking> tags, then delivers its public reply.
// The UI parses these tags and hides the thinking by default.
export const SCRATCHPAD_INSTRUCTION = `

THINK PRIVATELY FIRST: Before your public response, write a brief private monologue inside <thinking>...</thinking> tags. Use it to plan your strategy: what's the strongest version of your argument? What might other agents counter with? Where can you be sharper or more concrete?

After </thinking>, deliver your public reply in your normal voice. Do NOT reference your inner thoughts in the public reply — they stay private.

Example format:
<thinking>
The previous speaker leaned on emotional appeal. I should counter with hard data and a concrete example. My signature move is the rhetorical question — open with one.
</thinking>
But ask yourself this: where is the actual evidence?...`;

/**
 * Wraps any agent prompt with a scratchpad instruction when enabled.
 * The instruction is prepended so it sits at the top of the system context
 * and the model treats it as a meta-rule for every response.
 */
export const withScratchpad = (prompt: string, enabled: boolean): string => {
  if (!enabled) return prompt;
  return `${SCRATCHPAD_INSTRUCTION}\n\n${prompt}`;
};

/**
 * Wraps an agent prompt with a research context block from web search.
 * Injected as a separate section so the model treats it as background evidence.
 */
export const withResearchContext = (prompt: string, researchBlock: string): string => {
  if (!researchBlock) return prompt;
  return `${prompt}${researchBlock}`;
};

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
 * Generates expert settings instructions for prompts
 */
const getExpertInstructions = (settings?: ExpertSettings): string => {
  if (!settings) return '';
  
  const toneInstruction = toneInstructions[settings.conversationTone];
  const agreementInstruction = getAgreementInstruction(settings.agreementBias);
  const intensityInstruction = intensityModifiers[settings.personalityIntensity];
  
  return `

CONVERSATION STYLE INSTRUCTIONS:
- Tone: ${toneInstruction}
- Stance: ${agreementInstruction}
- Expression: ${intensityInstruction}`;
};

/**
 * Cache for agent names to ensure consistency and uniqueness within a conversation
 */
const agentNameCache = new Map<string, string>();
const usedFirstNames = new Set<string>();

/**
 * Clear the name cache (call when starting a new conversation)
 */
export const clearAgentNameCache = (): void => {
  agentNameCache.clear();
  usedFirstNames.clear();
  clearActiveAgentNames();
};

/**
 * Get a unique soap name for an agent, using cache to ensure consistency
 */
const getCachedAgentName = (agentLetter: string, persona: string): string => {
  const cacheKey = `${agentLetter}-${persona}`;
  
  if (agentNameCache.has(cacheKey)) {
    return agentNameCache.get(cacheKey)!;
  }
  
  const soapName = getAgentSoapName(`Agent ${agentLetter}`, persona, usedFirstNames);
  const firstName = soapName.split(' ')[0];
  usedFirstNames.add(firstName);
  agentNameCache.set(cacheKey, soapName);
  setActiveAgentName(agentLetter, soapName);
  
  return soapName;
};

/**
 * Module-level toggle for the Nous-style structured persona template.
 * Set from feature flag `use_persona_template` at conversation start.
 */
let USE_PERSONA_TEMPLATE = false;
export const setUsePersonaTemplate = (value: boolean): void => {
  USE_PERSONA_TEMPLATE = value;
};

/**
 * Structured persona template (Nous Research / Hermes style).
 * Anchors voice, beliefs and forbidden patterns so the agent stays
 * in character across long debates.
 */
const buildStructuredIntro = (soapName: string, agentLetter: string, persona: string): string => {
  return `[IDENTITY]
You are ${soapName}. Your archetype: "${persona}". Stay this character at all times.

[CORE BELIEFS]
- Your "${persona}" archetype shapes every argument you make.
- You have opinions and you defend them — never hedge into bland neutrality.

[VOICE]
- Distinctive cadence and word choice that fits a "${persona}" speaker.
- Reference other participants by name (never "Agent A/B/C").

[FORBIDDEN]
- Do NOT introduce yourself as "Agent ${agentLetter}" — always use "${soapName}".
- Do NOT produce empty platitudes ("great points all around"). Take a stance.
- Do NOT break character to comment on the format.

[DEBATE STRATEGY]
- Pick the strongest version of your position and press it.
- When you concede a point, concede precisely — then pivot to your sharper claim.

[TONE CALIBRATION]
- Keep self-introductions brief or skip them entirely.
- Match the conversation's intensity but keep your signature voice.`;
};

/**
 * Generates agent name introductions for the prompts
 */
const getAgentIntro = (agentLetter: string, persona: string): string => {
  const soapName = getCachedAgentName(agentLetter, persona);
  if (USE_PERSONA_TEMPLATE) {
    return buildStructuredIntro(soapName, agentLetter, persona);
  }
  return `You are ${soapName}. 

IMPORTANT NAME RULES:
- When introducing yourself, use "${soapName}" - NEVER say "Agent ${agentLetter}"
- Keep self-introductions brief or skip them entirely - the reader already knows who you are from the UI
- When referencing other participants, use their names (not "Agent A/B/C")

Speak and act as this character.`;
};

const getOtherAgentName = (agentLetter: string, persona: string): string => {
  return getCachedAgentName(agentLetter, persona);
};

/**
 * Generates the prompt for Agent A to start the conversation
 */
export const createAgentAInitialPrompt = (
  currentPrompt: string,
  currentScenario: ScenarioType,
  turnOrder: 'sequential' | 'random' | 'popcorn' = 'sequential',
  personaA: string = 'analytical',
  expertSettings?: ExpertSettings
): string => {
  const agentIntro = getAgentIntro('A', personaA);
  const basePrompt = currentScenario.promptTemplate(currentPrompt);
  const expertInstructions = getExpertInstructions(expertSettings);
  
  if (turnOrder === 'popcorn') {
    return `${agentIntro}${expertInstructions}\n\n${basePrompt}\n\nNote: This is a dynamic conversation. You can address other agents directly by name to invite their perspectives.`;
  }
  
  return `${agentIntro}${expertInstructions}\n\n${basePrompt}`;
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
  personaB: string = 'creative',
  expertSettings?: ExpertSettings
): string => {
  const agentIntro = getAgentIntro('B', personaB);
  const agentAName = getOtherAgentName('A', personaA);
  const expertInstructions = getExpertInstructions(expertSettings);
  
  return `
    ${agentIntro}${expertInstructions}
    
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
  personaC: string = 'strategic',
  expertSettings?: ExpertSettings
): string => {
  const agentIntro = getAgentIntro('C', personaC);
  const agentAName = getOtherAgentName('A', personaA);
  const agentBName = getOtherAgentName('B', personaB);
  const expertInstructions = getExpertInstructions(expertSettings);
  
  return `
    ${agentIntro}${expertInstructions}
    
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
  personaC: string = 'strategic',
  expertSettings?: ExpertSettings
): string => {
  const agentIntro = getAgentIntro('A', personaA);
  const agentBName = getOtherAgentName('B', personaB);
  const agentCName = getOtherAgentName('C', personaC);
  const expertInstructions = getExpertInstructions(expertSettings);
  
  if (numberOfAgents === 2) {
    return `${agentIntro}${expertInstructions}\n\n${currentScenario.followupTemplate(
      currentPrompt,
      agentAResponse,
      agentBResponse
    )}`;
  } else {
    return `
      ${agentIntro}${expertInstructions}
      
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
  personaC: string = 'strategic',
  expertSettings?: ExpertSettings
): string => {
  const agentIntro = getAgentIntro('B', personaB);
  const agentAName = getOtherAgentName('A', personaA);
  const agentCName = getOtherAgentName('C', personaC);
  const expertInstructions = getExpertInstructions(expertSettings);
  
  if (numberOfAgents === 2) {
    return `${agentIntro}${expertInstructions}\n\n${currentScenario.finalTemplate(
      currentPrompt,
      agentBResponse,
      agentAFollowup
    )}`;
  } else {
    return `
      ${agentIntro}${expertInstructions}
      
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
  personaC: string = 'strategic',
  expertSettings?: ExpertSettings
): string => {
  const agentIntro = getAgentIntro('C', personaC);
  const agentAName = getOtherAgentName('A', personaA);
  const agentBName = getOtherAgentName('B', personaB);
  const expertInstructions = getExpertInstructions(expertSettings);
  
  return `
    ${agentIntro}${expertInstructions}
    
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
