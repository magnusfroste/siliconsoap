
import { ScenarioType } from '../../../types';

/**
 * Generates the prompt for Agent A to start the conversation
 */
export const createAgentAInitialPrompt = (
  currentPrompt: string,
  currentScenario: ScenarioType
): string => {
  return currentScenario.promptTemplate(currentPrompt);
};

/**
 * Generates the prompt for Agent B to respond to Agent A
 */
export const createAgentBPrompt = (
  currentPrompt: string,
  agentAResponse: string,
  currentScenario: ScenarioType
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
  currentScenario: ScenarioType
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
