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

  const isDefaultsInitialized = useRef(false);

  // Effect 1: Set defaults from feature flags (access flags array directly to avoid stale closure)
  useEffect(() => {
    if (flagsLoading) return;
    if (flags.length === 0) return;
    if (isDefaultsInitialized.current) return;
    
    // Helper to read from flags array directly (avoids stale closure)
    const getTextFromFlags = (key: string): string | null => {
      const flag = flags.find(f => f.key === key);
      return flag?.text_value ?? null;
    };
    
    const defaultA = getTextFromFlags('default_model_agent_a');
    const defaultB = getTextFromFlags('default_model_agent_b');
    const defaultC = getTextFromFlags('default_model_agent_c');
    
    console.log("Setting model defaults from flags:", { defaultA, defaultB, defaultC });
    
    if (defaultA) setAgentAModel(defaultA);
    if (defaultB) setAgentBModel(defaultB);
    if (defaultC) setAgentCModel(defaultC);
    
    isDefaultsInitialized.current = true;
  }, [flagsLoading, flags]);

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
