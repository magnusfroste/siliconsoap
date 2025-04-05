
import { useState, useEffect } from 'react';
import { fetchOpenRouterModels, findDefaultModel } from '@/utils/openRouter';
import { AGENT_A_PREFERRED_MODELS, AGENT_B_PREFERRED_MODELS, AGENT_C_PREFERRED_MODELS } from '../constants';
import { OpenRouterModel } from '@/utils/openRouter/types';

export const useModels = (savedApiKey: string) => {
  const [agentAModel, setAgentAModel] = useState('');
  const [agentBModel, setAgentBModel] = useState('');
  const [agentCModel, setAgentCModel] = useState('');
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    const getModels = async () => {
      if (savedApiKey) {
        setLoadingModels(true);
        try {
          const models = await fetchOpenRouterModels(savedApiKey);
          setAvailableModels(models);
          
          if (models.length > 0) {
            // Find default models for each agent based on their preferred models list
            // Each agent gets selected independently
            const defaultAgentA = findDefaultModel(models, AGENT_A_PREFERRED_MODELS);
            const defaultAgentB = findDefaultModel(models, AGENT_B_PREFERRED_MODELS);
            
            // For Agent C, log more details to debug the issue
            console.log("Agent C preferred models:", AGENT_C_PREFERRED_MODELS);
            console.log("Available models for matching:", models.map(m => m.id));
            
            // Check if Gemma models exist in the available models
            const gemmaModels = models.filter(m => m.id.toLowerCase().includes('gemma'));
            console.log("Available Gemma models:", gemmaModels.map(m => m.id));
            
            const defaultAgentC = findDefaultModel(models, AGENT_C_PREFERRED_MODELS);
            
            console.log("Default model candidates:", {
              A: defaultAgentA,
              B: defaultAgentB,
              C: defaultAgentC,
              preferredA: AGENT_A_PREFERRED_MODELS[0],
              preferredB: AGENT_B_PREFERRED_MODELS[0],
              preferredC: AGENT_C_PREFERRED_MODELS[0]
            });
            
            // Set models independently - no fallbacks to Agent A's model
            if (defaultAgentA) setAgentAModel(defaultAgentA);
            if (defaultAgentB) setAgentBModel(defaultAgentB);
            if (defaultAgentC) setAgentCModel(defaultAgentC);
            
            // If any agent doesn't have a model selected, find the best available
            // without defaulting to another agent's model
            if (!defaultAgentA || !defaultAgentB || !defaultAgentC) {
              const findBestAlternative = (models: OpenRouterModel[]) => {
                // First try to find a free model
                const freeModel = models.find(m => m.isFree);
                if (freeModel) return freeModel.id;
                
                // Otherwise return first available model
                return models.length > 0 ? models[0].id : '';
              };
              
              if (!defaultAgentA) setAgentAModel(findBestAlternative(models));
              if (!defaultAgentB) setAgentBModel(findBestAlternative(models));
              if (!defaultAgentC) setAgentCModel(findBestAlternative(models));
            }
          }
        } catch (error) {
          console.error("Failed to fetch models:", error);
        } finally {
          setLoadingModels(false);
        }
      }
    };
    
    getModels();
  }, [savedApiKey]);

  return {
    agentAModel,
    setAgentAModel,
    agentBModel,
    setAgentBModel,
    agentCModel,
    setAgentCModel,
    availableModels,
    setAvailableModels,
    loadingModels,
    setLoadingModels
  };
};
