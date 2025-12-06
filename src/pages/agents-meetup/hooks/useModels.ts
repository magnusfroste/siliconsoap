import { useState, useEffect } from 'react';
import { fetchOpenRouterModels, findDefaultModel } from '@/utils/openRouter';
import { AGENT_A_PREFERRED_MODELS, AGENT_B_PREFERRED_MODELS, AGENT_C_PREFERRED_MODELS, DEFAULT_MODEL_IDS } from '@/utils/openRouter/models';
import { OpenRouterModel } from '@/utils/openRouter/types';
import { toast } from '@/hooks/use-toast';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

export const useModels = (apiKey: string) => {
  const { getTextValue, loading: flagsLoading } = useFeatureFlags();
  
  // Get default models from feature flags, fallback to hardcoded values
  const getDefaultModelId = (agent: 'A' | 'B' | 'C'): string => {
    if (flagsLoading) {
      // Return hardcoded defaults while loading
      return agent === 'A' ? DEFAULT_MODEL_IDS.agentA :
             agent === 'B' ? DEFAULT_MODEL_IDS.agentB :
             DEFAULT_MODEL_IDS.agentC;
    }
    
    const flagKey = agent === 'A' ? 'default_model_agent_a' :
                    agent === 'B' ? 'default_model_agent_b' :
                    'default_model_agent_c';
    
    const flagValue = getTextValue(flagKey);
    if (flagValue) return flagValue;
    
    // Fallback to hardcoded defaults
    return agent === 'A' ? DEFAULT_MODEL_IDS.agentA :
           agent === 'B' ? DEFAULT_MODEL_IDS.agentB :
           DEFAULT_MODEL_IDS.agentC;
  };
  
  const [agentAModel, setAgentAModel] = useState(() => getDefaultModelId('A'));
  const [agentBModel, setAgentBModel] = useState(() => getDefaultModelId('B'));
  const [agentCModel, setAgentCModel] = useState(() => getDefaultModelId('C'));
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    const getModels = async () => {
      // Wait for feature flags to load before setting defaults
      if (flagsLoading) {
        console.log("useModels: Waiting for feature flags to load...");
        return;
      }
      
      console.log("useModels: Fetching models (shared key mode)");
      setLoadingModels(true);
      try {
        const models = await fetchOpenRouterModels(apiKey);
        console.log("Fetched models count:", models.length);
        
        if (models.length === 0) {
          toast({
            title: "No Models Available",
            description: "Could not fetch models from OpenRouter.",
            variant: "destructive",
          });
        }
        
        setAvailableModels(models);
        
        if (models.length > 0) {
          const flagDefaultA = getTextValue('default_model_agent_a');
          const flagDefaultB = getTextValue('default_model_agent_b');
          const flagDefaultC = getTextValue('default_model_agent_c');
          
          const modelExists = (modelId: string) => models.some(m => m.id === modelId);
          
          // Helper to find best fallback
          const findBestAlternative = (models: OpenRouterModel[]) => {
            const freeModel = models.find(m => m.isFree);
            return freeModel?.id || models[0]?.id || '';
          };
          
          // Log warnings for invalid admin defaults
          if (flagDefaultA && !modelExists(flagDefaultA)) {
            console.warn(`Admin default model for Agent A not found: ${flagDefaultA}`);
          }
          if (flagDefaultB && !modelExists(flagDefaultB)) {
            console.warn(`Admin default model for Agent B not found: ${flagDefaultB}`);
          }
          if (flagDefaultC && !modelExists(flagDefaultC)) {
            console.warn(`Admin default model for Agent C not found: ${flagDefaultC}`);
          }
          
          // Determine defaults with guaranteed fallback
          const defaultAgentA = (flagDefaultA && modelExists(flagDefaultA))
            ? flagDefaultA 
            : findDefaultModel(models, AGENT_A_PREFERRED_MODELS) || findBestAlternative(models);
            
          const defaultAgentB = (flagDefaultB && modelExists(flagDefaultB))
            ? flagDefaultB 
            : findDefaultModel(models, AGENT_B_PREFERRED_MODELS) || findBestAlternative(models);
            
          const defaultAgentC = (flagDefaultC && modelExists(flagDefaultC))
            ? flagDefaultC 
            : findDefaultModel(models, AGENT_C_PREFERRED_MODELS) || findBestAlternative(models);
          
          console.log("Default models from flags:", { flagDefaultA, flagDefaultB, flagDefaultC });
          console.log("Final default models:", { A: defaultAgentA, B: defaultAgentB, C: defaultAgentC });
          
          // ALWAYS set models - never leave empty
          setAgentAModel(defaultAgentA);
          setAgentBModel(defaultAgentB);
          setAgentCModel(defaultAgentC);
        }
      } catch (error) {
        console.error("Failed to fetch models:", error);
        toast({
          title: "Error Fetching Models",
          description: "Failed to fetch models from OpenRouter.",
          variant: "destructive",
        });
      } finally {
        setLoadingModels(false);
      }
    };
    
    getModels();
  }, [apiKey, flagsLoading, getTextValue]);

  // Force refresh models function
  const refreshModels = async () => {
    // Allow refresh even with empty key (shared key mode)
    console.log("Manually refreshing models with API key:", apiKey ? apiKey.substring(0, 8) + "..." : "(shared key)");
    setLoadingModels(true);
    
    try {
      const models = await fetchOpenRouterModels(apiKey);
      console.log("Manually refreshed models count:", models.length);
      setAvailableModels(models);
      
      if (models.length > 0) {
        // Use feature flag values, fallback to preferred models
        const flagDefaultA = getTextValue('default_model_agent_a');
        const flagDefaultB = getTextValue('default_model_agent_b');
        const flagDefaultC = getTextValue('default_model_agent_c');
        
        const modelExists = (modelId: string) => models.some(m => m.id === modelId);
        
        const defaultAgentA = flagDefaultA && modelExists(flagDefaultA) 
          ? flagDefaultA 
          : findDefaultModel(models, AGENT_A_PREFERRED_MODELS);
        const defaultAgentB = flagDefaultB && modelExists(flagDefaultB) 
          ? flagDefaultB 
          : findDefaultModel(models, AGENT_B_PREFERRED_MODELS);
        const defaultAgentC = flagDefaultC && modelExists(flagDefaultC) 
          ? flagDefaultC 
          : findDefaultModel(models, AGENT_C_PREFERRED_MODELS);
        
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
