import { useState, useEffect, useRef } from 'react';
import { getEnabledModels, CuratedModel } from '@/repositories/curatedModelsRepository';
import { toast } from '@/hooks/use-toast';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

export const useModels = (apiKey: string) => {
  const { getTextValue, loading: flagsLoading } = useFeatureFlags();
  
  // Start with empty, will be set once flags load
  const [agentAModel, setAgentAModel] = useState('');
  const [agentBModel, setAgentBModel] = useState('');
  const [agentCModel, setAgentCModel] = useState('');
  const [availableModels, setAvailableModels] = useState<CuratedModel[]>([]);
  const [curatedModelsLoaded, setCuratedModelsLoaded] = useState(false);

  const isInitialized = useRef(false);

  // Fetch curated models list
  useEffect(() => {
    const loadCuratedModels = async () => {
      try {
        const models = await getEnabledModels();
        console.log("Fetched curated models count:", models.length);
        setAvailableModels(models);
        
        if (models.length === 0) {
          toast({
            title: "No Models Available",
            description: "No curated models configured. Contact admin.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Failed to fetch curated models:", error);
        toast({
          title: "Error Fetching Models",
          description: "Failed to fetch curated models.",
          variant: "destructive",
        });
      } finally {
        setCuratedModelsLoaded(true);
      }
    };
    
    loadCuratedModels();
  }, []);

  // Set defaults from feature flags once both flags and models are loaded
  useEffect(() => {
    if (flagsLoading || !curatedModelsLoaded || isInitialized.current) return;
    if (availableModels.length === 0) return;
    
    const defaultA = getTextValue('default_model_agent_a');
    const defaultB = getTextValue('default_model_agent_b');
    const defaultC = getTextValue('default_model_agent_c');
    
    console.log("Setting model defaults from flags:", { defaultA, defaultB, defaultC });
    
    const modelExists = (modelId: string | null) => 
      modelId && availableModels.some(m => m.model_id === modelId);
    
    const findFallback = () => {
      const freeModel = availableModels.find(m => m.is_free);
      return freeModel?.model_id || availableModels[0]?.model_id || '';
    };
    
    // Use flag value if it exists in curated models, otherwise fallback
    setAgentAModel(modelExists(defaultA) ? defaultA! : findFallback());
    setAgentBModel(modelExists(defaultB) ? defaultB! : findFallback());
    setAgentCModel(modelExists(defaultC) ? defaultC! : findFallback());
    
    isInitialized.current = true;
  }, [flagsLoading, curatedModelsLoaded, availableModels, getTextValue]);

  // Loading is true until both curated models AND defaults are set
  const loadingModels = !curatedModelsLoaded || flagsLoading || !isInitialized.current;

  // Force refresh curated models
  const refreshModels = async () => {
    console.log("Manually refreshing curated models");
    setCuratedModelsLoaded(false);
    isInitialized.current = false;
    
    try {
      const models = await getEnabledModels();
      console.log("Manually refreshed curated models count:", models.length);
      setAvailableModels(models);
      setCuratedModelsLoaded(true);
      
      if (models.length > 0) {
        const flagDefaultA = getTextValue('default_model_agent_a');
        const flagDefaultB = getTextValue('default_model_agent_b');
        const flagDefaultC = getTextValue('default_model_agent_c');
        
        const modelExists = (modelId: string | null) => 
          modelId && models.some(m => m.model_id === modelId);
        
        const findBestAlternative = (models: CuratedModel[]) => {
          const freeModel = models.find(m => m.is_free);
          return freeModel?.model_id || models[0]?.model_id || '';
        };
        
        const defaultAgentA = modelExists(flagDefaultA) 
          ? flagDefaultA! 
          : findBestAlternative(models);
        const defaultAgentB = modelExists(flagDefaultB) 
          ? flagDefaultB! 
          : findBestAlternative(models);
        const defaultAgentC = modelExists(flagDefaultC) 
          ? flagDefaultC! 
          : findBestAlternative(models);
        
        setAgentAModel(defaultAgentA);
        setAgentBModel(defaultAgentB);
        setAgentCModel(defaultAgentC);
        isInitialized.current = true;
      }
    } catch (error) {
      console.error("Failed to manually refresh curated models:", error);
      setCuratedModelsLoaded(true);
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
