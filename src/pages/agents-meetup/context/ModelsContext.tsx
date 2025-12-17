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

export const ModelsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize with empty strings - will be populated from database
  const [agentAModel, setAgentAModel] = useState('');
  const [agentBModel, setAgentBModel] = useState('');
  const [agentCModel, setAgentCModel] = useState('');
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
          setLoadingModels(false);
          setInitialized(true);
          return;
        }
        
        setAvailableModels(models);
        
        // Set defaults from database (using default_for_agent column)
        const defaultA = models.find(m => m.default_for_agent === 'A');
        const defaultB = models.find(m => m.default_for_agent === 'B');
        const defaultC = models.find(m => m.default_for_agent === 'C');
        
        // Use database defaults, or fall back to first available models
        const modelA = defaultA?.model_id || models[0]?.model_id || '';
        const modelB = defaultB?.model_id || models[Math.min(1, models.length - 1)]?.model_id || '';
        const modelC = defaultC?.model_id || models[Math.min(2, models.length - 1)]?.model_id || '';
        
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
  agentAModel: '',
  setAgentAModel: () => console.warn('[ModelsContext] setAgentAModel called outside provider'),
  agentBModel: '',
  setAgentBModel: () => console.warn('[ModelsContext] setAgentBModel called outside provider'),
  agentCModel: '',
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
