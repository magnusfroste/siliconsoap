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
  const [loadingModels, setLoadingModels] = useState(true);

  const isInitialized = useRef(false);

  // Set defaults from feature flags (same pattern as useProfiles)
  useEffect(() => {
    if (flagsLoading || isInitialized.current) return;
    
    const defaultA = getTextValue('default_model_agent_a');
    const defaultB = getTextValue('default_model_agent_b');
    const defaultC = getTextValue('default_model_agent_c');
    
    console.log("Setting model defaults from flags:", { defaultA, defaultB, defaultC });
    
    if (defaultA) setAgentAModel(defaultA);
    if (defaultB) setAgentBModel(defaultB);
    if (defaultC) setAgentCModel(defaultC);
    
    isInitialized.current = true;
  }, [flagsLoading, getTextValue]);

  // Fetch curated models list (separate from setting defaults)
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
        setLoadingModels(false);
      }
    };
    
    loadCuratedModels();
  }, []);

  // Force refresh curated models
  const refreshModels = async () => {
    console.log("Manually refreshing curated models");
    setLoadingModels(true);
    
    try {
      const models = await getEnabledModels();
      console.log("Manually refreshed curated models count:", models.length);
      setAvailableModels(models);
      
      if (models.length > 0) {
        const flagDefaultA = getTextValue('default_model_agent_a');
        const flagDefaultB = getTextValue('default_model_agent_b');
        const flagDefaultC = getTextValue('default_model_agent_c');
        
        const modelExists = (modelId: string) => models.some(m => m.model_id === modelId);
        
        const findBestAlternative = (models: CuratedModel[]) => {
          const freeModel = models.find(m => m.is_free);
          return freeModel?.model_id || models[0]?.model_id || '';
        };
        
        const defaultAgentA = (flagDefaultA && modelExists(flagDefaultA)) 
          ? flagDefaultA 
          : findBestAlternative(models);
        const defaultAgentB = (flagDefaultB && modelExists(flagDefaultB)) 
          ? flagDefaultB 
          : findBestAlternative(models);
        const defaultAgentC = (flagDefaultC && modelExists(flagDefaultC)) 
          ? flagDefaultC 
          : findBestAlternative(models);
        
        if (defaultAgentA) setAgentAModel(defaultAgentA);
        if (defaultAgentB) setAgentBModel(defaultAgentB);
        if (defaultAgentC) setAgentCModel(defaultAgentC);
      }
    } catch (error) {
      console.error("Failed to manually refresh curated models:", error);
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
