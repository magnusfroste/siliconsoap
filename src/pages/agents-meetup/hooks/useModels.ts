import { useState, useEffect, useRef } from 'react';
import { getEnabledModels, CuratedModel } from '@/repositories/curatedModelsRepository';
import { toast } from '@/hooks/use-toast';

export const useModels = (apiKey: string) => {
  const [agentAModel, setAgentAModel] = useState('');
  const [agentBModel, setAgentBModel] = useState('');
  const [agentCModel, setAgentCModel] = useState('');
  const [availableModels, setAvailableModels] = useState<CuratedModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);

  const isDefaultsInitialized = useRef(false);

  // Single effect: Fetch models and set defaults from default_for_agent column
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
        
        // Set defaults from the models themselves (no race condition!)
        if (!isDefaultsInitialized.current) {
          const defaultA = models.find(m => m.default_for_agent === 'A');
          const defaultB = models.find(m => m.default_for_agent === 'B');
          const defaultC = models.find(m => m.default_for_agent === 'C');
          
          console.log("Setting model defaults from curated_models:", { 
            defaultA: defaultA?.model_id, 
            defaultB: defaultB?.model_id, 
            defaultC: defaultC?.model_id 
          });
          
          if (defaultA) setAgentAModel(defaultA.model_id);
          if (defaultB) setAgentBModel(defaultB.model_id);
          if (defaultC) setAgentCModel(defaultC.model_id);
          
          isDefaultsInitialized.current = true;
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
