import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { callOpenRouter, isModelFree } from '@/utils/openRouter';
import { ConversationMessage, ResponseLength, ScenarioType } from '../../types';

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
    
    if (!currentPrompt.trim()) {
      toast({
        title: "Input required",
        description: `Please enter ${currentScenario.id === 'text-analysis' ? 'text' : 'a prompt'} for the agents to analyze.`,
        variant: "destructive",
      });
      return;
    }
    
    if (!savedApiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenRouter API key.",
        variant: "destructive",
      });
      return;
    }
    
    const needsAgentAUserKey = !isModelFree(agentAModel);
    const needsAgentBUserKey = numberOfAgents >= 2 && !isModelFree(agentBModel);
    const needsAgentCUserKey = numberOfAgents >= 3 && !isModelFree(agentCModel);
    
    if ((needsAgentAUserKey || needsAgentBUserKey || needsAgentCUserKey) && !userApiKey) {
      toast({
        title: "API Key Required",
        description: "One or more selected models require your own OpenRouter API key. Please provide it in the settings.",
        variant: "destructive",
      });
      return;
    }
    
    setConversation([]);
    setIsLoading(true);
    
    try {
      // Agent A always starts the conversation
      const agentAPrompt = currentScenario.promptTemplate(currentPrompt);
      
      const agentAResponse = await callOpenRouter(
        agentAPrompt,
        agentAModel,
        agentAPersona,
        savedApiKey,
        responseLength,
        userApiKey
      );
      
      setConversation([{
        agent: 'Agent A',
        message: agentAResponse,
        model: agentAModel,
        persona: agentAPersona
      }]);
      
      // If only one agent, we're done
      if (numberOfAgents === 1) {
        setIsLoading(false);
        return;
      }
      
      // Agent B response
      const agentBPrompt = `
        ${currentScenario.id === 'text-analysis' ? `Agent A analyzed this original text: "${currentPrompt}"` : `We're discussing: "${currentPrompt}"`}
        
        Agent A's ${currentScenario.id === 'text-analysis' ? 'analysis' : 'response'} was: "${agentAResponse}"
        
        ${currentScenario.id === 'text-analysis' 
          ? `Based on both the original text and Agent A's analysis, who do you think wrote the text?` 
          : `What's your perspective on this topic? You can agree or disagree with Agent A.`} 
        Provide your own perspective.
      `;
      
      const agentBResponse = await callOpenRouter(
        agentBPrompt,
        agentBModel,
        agentBPersona,
        savedApiKey,
        responseLength,
        userApiKey
      );
      
      setConversation(prev => [
        ...prev,
        {
          agent: 'Agent B',
          message: agentBResponse,
          model: agentBModel,
          persona: agentBPersona
        }
      ]);
      
      // If only two agents or no additional rounds needed, we're done
      if (numberOfAgents === 2 && rounds === 1) {
        setIsLoading(false);
        return;
      }
      
      // Agent C response (if three agents are selected)
      if (numberOfAgents === 3) {
        const agentCPrompt = `
          ${currentScenario.id === 'text-analysis' ? `We're analyzing this original text: "${currentPrompt}"` : `We're discussing: "${currentPrompt}"`}
          
          Agent A's response was: "${agentAResponse}"
          
          Agent B's response was: "${agentBResponse}"
          
          Based on both responses and the original ${currentScenario.id === 'text-analysis' ? 'text' : 'topic'}, what is your perspective?
          You may agree or disagree with either agent, or provide a completely different take.
        `;
        
        const agentCResponse = await callOpenRouter(
          agentCPrompt,
          agentCModel,
          agentCPersona,
          savedApiKey,
          responseLength,
          userApiKey
        );
        
        setConversation(prev => [
          ...prev,
          {
            agent: 'Agent C',
            message: agentCResponse,
            model: agentCModel,
            persona: agentCPersona
          }
        ]);
        
        // If only one round, we're done
        if (rounds === 1) {
          setIsLoading(false);
          return;
        }
      }
      
      await handleAdditionalRounds(
        currentPrompt, 
        currentScenario, 
        agentAResponse, 
        agentBResponse
      );
      
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

  const handleAdditionalRounds = async (
    currentPrompt: string,
    currentScenario: ScenarioType,
    agentAResponse: string,
    agentBResponse: string
  ) => {
    if (rounds <= 1) return;
    
    // Second round - Agent A responds to previous responses
    let agentAFollowupPrompt;
    
    if (numberOfAgents === 2) {
      // Only Agent B responded previously
      agentAFollowupPrompt = currentScenario.followupTemplate(
        currentPrompt,
        agentAResponse,
        agentBResponse
      );
    } else if (numberOfAgents === 3) {
      // Both Agent B and C responded
      const latestAgentCResponse = conversation.find(c => c.agent === 'Agent C')?.message || '';
      
      agentAFollowupPrompt = `
        We're discussing ${currentScenario.id === 'text-analysis' ? `this text: "${currentPrompt}"` : `this topic: "${currentPrompt}"`}
        
        My initial response was: "${agentAResponse}"
        
        Agent B responded: "${agentBResponse}"
        
        Agent C responded: "${latestAgentCResponse}"
        
        How would you respond to both agents' perspectives? Do you agree with either of them or do you have additional insights? 
        Remember that you are Agent A - refer to the other agents as Agent B and Agent C.
      `;
    }
    
    const agentAFollowup = await callOpenRouter(
      agentAFollowupPrompt || '',
      agentAModel,
      agentAPersona,
      savedApiKey,
      responseLength,
      userApiKey
    );
    
    setConversation(prev => [
      ...prev,
      {
        agent: 'Agent A',
        message: agentAFollowup,
        model: agentAModel,
        persona: agentAPersona
      }
    ]);
    
    if (rounds > 2 || (rounds === 2 && numberOfAgents === 3)) {
      // Final responses for third round
      let agentBFinalPrompt;
      
      if (numberOfAgents === 2) {
        agentBFinalPrompt = currentScenario.finalTemplate(
          currentPrompt,
          agentBResponse,
          agentAFollowup
        );
      } else if (numberOfAgents === 3) {
        agentBFinalPrompt = `
          We're discussing ${currentScenario.id === 'text-analysis' ? `this text: "${currentPrompt}"` : `this topic: "${currentPrompt}"`}
          
          My previous response was: "${agentBResponse}"
          
          Agent A has responded with: "${agentAFollowup}"
          
          Considering all perspectives shared so far, what's your final assessment or conclusion?
          Remember that you are Agent B - refer to the other agents as Agent A and Agent C.
        `;
      }
      
      const agentBFinal = await callOpenRouter(
        agentBFinalPrompt || '',
        agentBModel,
        agentBPersona,
        savedApiKey,
        responseLength,
        userApiKey
      );
      
      setConversation(prev => [
        ...prev,
        {
          agent: 'Agent B',
          message: agentBFinal,
          model: agentBModel,
          persona: agentBPersona
        }
      ]);
      
      // Only for 3 agents, add final Agent C response
      if (numberOfAgents === 3 && rounds === 3) {
        const agentCFinalPrompt = `
          We're discussing ${currentScenario.id === 'text-analysis' ? `this text: "${currentPrompt}"` : `this topic: "${currentPrompt}"`}
          
          The conversation so far has included multiple perspectives.
          
          Agent A's latest response: "${agentAFollowup}"
          Agent B's latest response: "${agentBFinal}"
          
          What's your final assessment or conclusion on this topic? You may offer a synthesis of the ideas presented or a unique perspective.
          Remember that you are Agent C - refer to the other agents as Agent A and Agent B.
        `;
        
        const agentCFinal = await callOpenRouter(
          agentCFinalPrompt,
          agentCModel,
          agentCPersona,
          savedApiKey,
          responseLength,
          userApiKey
        );
        
        setConversation(prev => [
          ...prev,
          {
            agent: 'Agent C',
            message: agentCFinal,
            model: agentCModel,
            persona: agentCPersona
          }
        ]);
      }
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
