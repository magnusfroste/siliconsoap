import { useState, useEffect, useRef } from 'react';
import { getEnabledModels, CuratedModel } from '@/repositories/curatedModelsRepository';
import { toast } from '@/hooks/use-toast';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

export const useModels = (apiKey: string) => {
  const { getTextValue, loading: flagsLoading } = useFeatureFlags();
  
  const [agentAModel, setAgentAModel] = useState('');
  const [agentBModel, setAgentBModel] = useState('');
  const [agentCModel, setAgentCModel] = useState('');
  const [availableModels, setAvailableModels] = useState<CuratedModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);

  const isDefaultsInitialized = useRef(false);

  // Effect 1: Set defaults from feature flags (simple, synchronous - matches useProfiles pattern)
  useEffect(() => {
    if (flagsLoading || isDefaultsInitialized.current) return;
    
    const defaultA = getTextValue('default_model_agent_a');
    const defaultB = getTextValue('default_model_agent_b');
    const defaultC = getTextValue('default_model_agent_c');
    
    console.log("Setting model defaults from flags:", { defaultA, defaultB, defaultC });
    
    // Set defaults immediately - no async, no waiting for models list
    if (defaultA) setAgentAModel(defaultA);
    if (defaultB) setAgentBModel(defaultB);
    if (defaultC) setAgentCModel(defaultC);
    
    isDefaultsInitialized.current = true;
  }, [flagsLoading, getTextValue]);

  // Effect 2: Fetch available models for dropdowns (separate concern)
  useEffect(() => {
    const loadModels = async () => {
      try {
        const models = await getEnabledModels();
        console.log("Fetched curated models count:", models.length);
        
        if (models.length === 0) {
          toast({
            title: "No Models Available",
            description: "No curated models configured. Contact admin.",
            variant: "destructive",
          });
        }
        
        setAvailableModels(models);
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
    
    loadModels();
  }, []); // Run once on mount

  // Force refresh curated models
  const refreshModels = async () => {
    console.log("Manually refreshing curated models");
    setLoadingModels(true);
    
    try {
      const models = await getEnabledModels();
      console.log("Manually refreshed curated models count:", models.length);
      setAvailableModels(models);
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
    refreshModels
  };
};
