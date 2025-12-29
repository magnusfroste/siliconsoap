import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CuratedModel, getEnabledModels } from "@/repositories/curatedModelsRepository";

// Default models for each agent - must exist in the curated_models table
const DEFAULT_AGENT_MODELS = {
  agentA: "x-ai/grok-4-fast",
  agentB: "qwen/qwen3-32b", 
  agentC: "mistralai/mixtral-8x7b-instruct",
};

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
  const [agentModels, setAgentModels] = useState(DEFAULT_AGENT_MODELS);
  const [availableModels, setAvailableModels] = useState<CuratedModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);

  // Load curated models from database
  useEffect(() => {
    const loadModels = async () => {
      try {
        const models = await getEnabledModels();
        setAvailableModels(models);
      } catch (error) {
        console.error("Failed to load curated models:", error);
      } finally {
        setLoadingModels(false);
      }
    };
    loadModels();
  }, []);

  // Wrapper setters for backward compatibility
  const setAgentAModel = (model: string) => {
    setAgentModels((prev) => ({ ...prev, agentA: model }));
  };
  const setAgentBModel = (model: string) => {
    setAgentModels((prev) => ({ ...prev, agentB: model }));
  };
  const setAgentCModel = (model: string) => {
    setAgentModels((prev) => ({ ...prev, agentC: model }));
  };

  const refreshModels = async () => {
    setLoadingModels(true);
    try {
      const models = await getEnabledModels();
      if (models.length > 0) {
        setAvailableModels(models);
      }
    } catch (error) {
      console.error("Failed to refresh models:", error);
    } finally {
      setLoadingModels(false);
    }
  };

  return (
    <ModelsContext.Provider
      value={{
        agentAModel: agentModels.agentA,
        setAgentAModel,
        agentBModel: agentModels.agentB,
        setAgentBModel,
        agentCModel: agentModels.agentC,
        setAgentCModel,
        availableModels,
        setAvailableModels,
        loadingModels,
        refreshModels,
      }}
    >
      {children}
    </ModelsContext.Provider>
  );
};

// Fallback context for when used outside provider (shouldn't happen but provides safety)
const fallbackContext: ModelsContextType = {
  agentAModel: "",
  setAgentAModel: () => console.warn("[ModelsContext] setAgentAModel called outside provider"),
  agentBModel: "",
  setAgentBModel: () => console.warn("[ModelsContext] setAgentBModel called outside provider"),
  agentCModel: "",
  setAgentCModel: () => console.warn("[ModelsContext] setAgentCModel called outside provider"),
  availableModels: [],
  setAvailableModels: () => console.warn("[ModelsContext] setAvailableModels called outside provider"),
  loadingModels: true,
  refreshModels: async () => console.warn("[ModelsContext] refreshModels called outside provider"),
};

export const useModelsContext = (): ModelsContextType => {
  const context = useContext(ModelsContext);
  if (!context) {
    console.warn("[ModelsContext] useModelsContext called outside ModelsProvider, using fallback");
    return fallbackContext;
  }
  return context;
};
