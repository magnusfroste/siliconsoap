import { useState, useEffect, useRef } from 'react';
import { getEnabledModels, CuratedModel } from '@/repositories/curatedModelsRepository';
import { DEFAULT_MODEL_IDS } from '@/utils/openRouter/models';
import { toast } from '@/hooks/use-toast';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

export const useModels = (apiKey: string) => {
  const { getTextValue, loading: flagsLoading } = useFeatureFlags();
  
  // Get default models from feature flags, fallback to hardcoded values
  const getDefaultModelId = (agent: 'A' | 'B' | 'C'): string => {
    if (flagsLoading) {
      return agent === 'A' ? DEFAULT_MODEL_IDS.agentA :
             agent === 'B' ? DEFAULT_MODEL_IDS.agentB :
             DEFAULT_MODEL_IDS.agentC;
    }
    
    const flagKey = agent === 'A' ? 'default_model_agent_a' :
                    agent === 'B' ? 'default_model_agent_b' :
                    'default_model_agent_c';
    
    const flagValue = getTextValue(flagKey);
    if (flagValue) return flagValue;
    
    return agent === 'A' ? DEFAULT_MODEL_IDS.agentA :
           agent === 'B' ? DEFAULT_MODEL_IDS.agentB :
           DEFAULT_MODEL_IDS.agentC;
  };
  
  const [agentAModel, setAgentAModel] = useState('');
  const [agentBModel, setAgentBModel] = useState('');
  const [agentCModel, setAgentCModel] = useState('');
  const [availableModels, setAvailableModels] = useState<CuratedModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);

  // Ref to prevent duplicate fetches
  const isFetching = useRef(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    const loadCuratedModels = async () => {
      if (flagsLoading) return;
      if (isFetching.current || hasFetched.current) return;
      
      isFetching.current = true;
      setLoadingModels(true);
      
      try {
        // Fetch only curated enabled models
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
        hasFetched.current = true;
        
        if (models.length > 0) {
          const flagDefaultA = getTextValue('default_model_agent_a');
          const flagDefaultB = getTextValue('default_model_agent_b');
          const flagDefaultC = getTextValue('default_model_agent_c');
          
          const modelExists = (modelId: string) => models.some(m => m.model_id === modelId);
          
          // Helper to find best fallback from curated models
          const findBestAlternative = (models: CuratedModel[]) => {
            const freeModel = models.find(m => m.is_free);
            return freeModel?.model_id || models[0]?.model_id || '';
          };
          
          // Log warnings for invalid admin defaults
          if (flagDefaultA && !modelExists(flagDefaultA)) {
            console.warn(`Admin default model for Agent A not in curated list: ${flagDefaultA}`);
          }
          if (flagDefaultB && !modelExists(flagDefaultB)) {
            console.warn(`Admin default model for Agent B not in curated list: ${flagDefaultB}`);
          }
          if (flagDefaultC && !modelExists(flagDefaultC)) {
            console.warn(`Admin default model for Agent C not in curated list: ${flagDefaultC}`);
          }
          
          // Determine defaults with guaranteed fallback to curated models
          const defaultAgentA = (flagDefaultA && modelExists(flagDefaultA))
            ? flagDefaultA 
            : findBestAlternative(models);
            
          const defaultAgentB = (flagDefaultB && modelExists(flagDefaultB))
            ? flagDefaultB 
            : findBestAlternative(models);
            
          const defaultAgentC = (flagDefaultC && modelExists(flagDefaultC))
            ? flagDefaultC 
            : findBestAlternative(models);
          
          setAgentAModel(defaultAgentA);
          setAgentBModel(defaultAgentB);
          setAgentCModel(defaultAgentC);
        }
      } catch (error) {
        console.error("Failed to fetch curated models:", error);
        toast({
          title: "Error Fetching Models",
          description: "Failed to fetch curated models.",
          variant: "destructive",
        });
      } finally {
        isFetching.current = false;
        setLoadingModels(false);
      }
    };
    
    loadCuratedModels();
  }, [flagsLoading, getTextValue]);

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
