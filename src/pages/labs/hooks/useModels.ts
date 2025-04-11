import { useState, useEffect } from 'react';
import { fetchOpenRouterModels, findDefaultModel } from '@/utils/openRouter';
import { AGENT_A_PREFERRED_MODELS, AGENT_B_PREFERRED_MODELS, AGENT_C_PREFERRED_MODELS } from '@/utils/openRouter/models';
import { OpenRouterModel } from '@/utils/openRouter/types';
import { toast } from '@/hooks/use-toast';

export const useModels = (apiKey: string) => {
  const [agentAModel, setAgentAModel] = useState('');
  const [agentBModel, setAgentBModel] = useState('');
  const [agentCModel, setAgentCModel] = useState('');
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    const getModels = async () => {
      console.log("useModels: API key exists:", !!apiKey);
      if (apiKey) {
        setLoadingModels(true);
        try {
          console.log("Fetching models with API key:", apiKey.substring(0, 8) + "...");
          const models = await fetchOpenRouterModels(apiKey);
          console.log("Fetched models count:", models.length);
          
          if (models.length === 0) {
            toast({
              title: "No Models Available",
              description: "Could not fetch models from OpenRouter. Please check your API key.",
              variant: "destructive",
            });
          } else {
            console.log("Models loaded successfully:", models.length);
            // Log some sample models
            if (models.length > 0) {
              console.log("Sample models:", models.slice(0, 3).map(m => m.id));
            }
          }
          
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
          toast({
            title: "Error Fetching Models",
            description: "Failed to fetch models from OpenRouter. Please check your API key and try again.",
            variant: "destructive",
          });
        } finally {
          setLoadingModels(false);
        }
      }
    };
    
    getModels();
  }, [apiKey]);

  // Force refresh models function
  const refreshModels = async () => {
    if (!apiKey) return;
    
    console.log("Manually refreshing models with API key:", apiKey.substring(0, 8) + "...");
    setLoadingModels(true);
    
    try {
      const models = await fetchOpenRouterModels(apiKey);
      console.log("Manually refreshed models count:", models.length);
      setAvailableModels(models);
      
      if (models.length > 0) {
        // Find default models for each agent
        const defaultAgentA = findDefaultModel(models, AGENT_A_PREFERRED_MODELS);
        const defaultAgentB = findDefaultModel(models, AGENT_B_PREFERRED_MODELS);
        const defaultAgentC = findDefaultModel(models, AGENT_C_PREFERRED_MODELS);
        
        // Set models independently
        if (defaultAgentA) setAgentAModel(defaultAgentA);
        if (defaultAgentB) setAgentBModel(defaultAgentB);
        if (defaultAgentC) setAgentCModel(defaultAgentC);
      }
    } catch (error) {
      console.error("Failed to manually refresh models:", error);
    } finally {
      setLoadingModels(false);
    }
  };

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
    setLoadingModels,
    refreshModels
  };
};
