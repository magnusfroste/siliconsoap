import { useState, useEffect, useRef } from 'react';
import { getEnabledModels, CuratedModel } from '@/repositories/curatedModelsRepository';
import { toast } from '@/hooks/use-toast';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

export const useModels = (apiKey: string) => {
  const { flags, loading: flagsLoading } = useFeatureFlags();
  
  const [agentAModel, setAgentAModel] = useState('');
  const [agentBModel, setAgentBModel] = useState('');
  const [agentCModel, setAgentCModel] = useState('');
  const [availableModels, setAvailableModels] = useState<CuratedModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);

  const isInitialized = useRef(false);

  // Single effect that waits for flags then fetches models and sets defaults
  useEffect(() => {
    // Wait for feature flags to load AND have data
    if (flagsLoading) return;
    if (flags.length === 0) return;
    if (isInitialized.current) return;

    // Helper to read directly from flags array (avoids stale closure)
    const getTextFromFlags = (key: string): string | null => {
      const flag = flags.find(f => f.key === key);
      return flag?.text_value ?? null;
    };

    const loadModelsAndSetDefaults = async () => {
      try {
        const models = await getEnabledModels();
        console.log("Fetched curated models count:", models.length);
        
        if (models.length === 0) {
          toast({
            title: "No Models Available",
            description: "No curated models configured. Contact admin.",
            variant: "destructive",
          });
          setLoadingModels(false);
          isInitialized.current = true;
          return;
        }

        // Set available models
        setAvailableModels(models);
        
        // Get defaults from feature flags
        const defaultA = getTextFromFlags('default_model_agent_a');
        const defaultB = getTextFromFlags('default_model_agent_b');
        const defaultC = getTextFromFlags('default_model_agent_c');
        
        console.log("Setting model defaults from flags:", { defaultA, defaultB, defaultC });
        
        const modelExists = (modelId: string | null) => 
          modelId && models.some(m => m.model_id === modelId);
        
        const fallback = models[0]?.model_id || '';
        
        // Set defaults - using `models` directly (not state) to avoid race condition
        setAgentAModel(modelExists(defaultA) ? defaultA! : fallback);
        setAgentBModel(modelExists(defaultB) ? defaultB! : fallback);
        setAgentCModel(modelExists(defaultC) ? defaultC! : fallback);
        
        isInitialized.current = true;
        setLoadingModels(false);
        
      } catch (error) {
        console.error("Failed to fetch curated models:", error);
        toast({
          title: "Error Fetching Models",
          description: "Failed to fetch curated models.",
          variant: "destructive",
        });
        setLoadingModels(false);
        isInitialized.current = true;
      }
    };
    
    loadModelsAndSetDefaults();
  }, [flagsLoading, flags]);

  // Force refresh curated models
  const refreshModels = async () => {
    console.log("Manually refreshing curated models");
    setLoadingModels(true);
    isInitialized.current = false;

    // Helper to read directly from flags array
    const getTextFromFlags = (key: string): string | null => {
      const flag = flags.find(f => f.key === key);
      return flag?.text_value ?? null;
    };
    
    try {
      const models = await getEnabledModels();
      console.log("Manually refreshed curated models count:", models.length);
      setAvailableModels(models);
      
      if (models.length > 0) {
        const flagDefaultA = getTextFromFlags('default_model_agent_a');
        const flagDefaultB = getTextFromFlags('default_model_agent_b');
        const flagDefaultC = getTextFromFlags('default_model_agent_c');
        
        const modelExists = (modelId: string | null) => 
          modelId && models.some(m => m.model_id === modelId);
        
        const fallback = models[0]?.model_id || '';
        
        const defaultAgentA = modelExists(flagDefaultA) ? flagDefaultA! : fallback;
        const defaultAgentB = modelExists(flagDefaultB) ? flagDefaultB! : fallback;
        const defaultAgentC = modelExists(flagDefaultC) ? flagDefaultC! : fallback;
        
        setAgentAModel(defaultAgentA);
        setAgentBModel(defaultAgentB);
        setAgentCModel(defaultAgentC);
        isInitialized.current = true;
      }
      setLoadingModels(false);
    } catch (error) {
      console.error("Failed to manually refresh curated models:", error);
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
    refreshModels
  };
};
