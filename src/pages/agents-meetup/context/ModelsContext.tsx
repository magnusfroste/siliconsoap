import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getEnabledModels, CuratedModel } from '@/repositories/curatedModelsRepository';
import { toast } from '@/hooks/use-toast';

interface ModelsContextType {
  agentAModel: string;
  setAgentAModel: (model: string) => void;
  agentBModel: string;
  setAgentBModel: (model: string) => void;
  agentCModel: string;
  setAgentCModel: (model: string) => void;
  availableModels: CuratedModel[];
  setAvailableModels: (models: CuratedModel[]) => void;
  loadingModels: boolean;
  refreshModels: () => Promise<void>;
}

const ModelsContext = createContext<ModelsContextType | null>(null);

// Hardcoded defaults - these are used as initial values and fallbacks
// These should match what's configured in the admin panel
const DEFAULT_MODEL_A = 'google/gemini-2.5-flash';
const DEFAULT_MODEL_B = 'deepseek/deepseek-chat-v3-0324';
const DEFAULT_MODEL_C = 'x-ai/grok-4.1-fast';

export const ModelsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize with hardcoded defaults so dropdowns show values immediately
  const [agentAModel, setAgentAModel] = useState(DEFAULT_MODEL_A);
  const [agentBModel, setAgentBModel] = useState(DEFAULT_MODEL_B);
  const [agentCModel, setAgentCModel] = useState(DEFAULT_MODEL_C);
  const [availableModels, setAvailableModels] = useState<CuratedModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Fetch models and set defaults on mount
  useEffect(() => {
    if (initialized) return;
    
    const loadModels = async () => {
      try {
        const models = await getEnabledModels();
        
        if (models.length === 0) {
          toast({
            title: "No Models Available",
            description: "No curated models configured. Contact admin.",
            variant: "destructive",
          });
        }
        
        setAvailableModels(models);
        
        // Set defaults from the models (using default_for_agent column)
        const defaultA = models.find(m => m.default_for_agent === 'A');
        const defaultB = models.find(m => m.default_for_agent === 'B');
        const defaultC = models.find(m => m.default_for_agent === 'C');
        
        const modelA = defaultA?.model_id || models[0]?.model_id || DEFAULT_MODEL_A;
        const modelB = defaultB?.model_id || models[1]?.model_id || DEFAULT_MODEL_B;
        const modelC = defaultC?.model_id || models[2]?.model_id || DEFAULT_MODEL_C;
        
        // Check if selected models exist in the enabled models list
        const modelAExists = models.some(m => m.model_id === modelA);
        const modelBExists = models.some(m => m.model_id === modelB);
        const modelCExists = models.some(m => m.model_id === modelC);
        
        console.log("[ModelsContext] Setting agent models from DB:", { 
          modelA, modelAExists,
          modelB, modelBExists,
          modelC, modelCExists
        });
        
        setAgentAModel(modelA);
        setAgentBModel(modelB);
        setAgentCModel(modelC);
        setInitialized(true);
      } catch (error) {
        console.error("[ModelsContext] Failed to fetch curated models:", error);
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
  }, [initialized]);

  const refreshModels = async () => {
    setLoadingModels(true);
    
    try {
      const models = await getEnabledModels();
      setAvailableModels(models);
    } catch (error) {
      console.error("Failed to refresh curated models:", error);
    } finally {
      setLoadingModels(false);
    }
  };

  return (
    <ModelsContext.Provider value={{
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
    }}>
      {children}
    </ModelsContext.Provider>
  );
};

// Fallback context for when used outside provider (shouldn't happen but provides safety)
const fallbackContext: ModelsContextType = {
  agentAModel: DEFAULT_MODEL_A,
  setAgentAModel: () => console.warn('[ModelsContext] setAgentAModel called outside provider'),
  agentBModel: DEFAULT_MODEL_B,
  setAgentBModel: () => console.warn('[ModelsContext] setAgentBModel called outside provider'),
  agentCModel: DEFAULT_MODEL_C,
  setAgentCModel: () => console.warn('[ModelsContext] setAgentCModel called outside provider'),
  availableModels: [],
  setAvailableModels: () => console.warn('[ModelsContext] setAvailableModels called outside provider'),
  loadingModels: true,
  refreshModels: async () => console.warn('[ModelsContext] refreshModels called outside provider'),
};

export const useModelsContext = (): ModelsContextType => {
  const context = useContext(ModelsContext);
  if (!context) {
    console.warn('[ModelsContext] useModelsContext called outside ModelsProvider, using fallback');
    return fallbackContext;
  }
  return context;
};
