import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CuratedModel, getEnabledModels } from "@/repositories/curatedModelsRepository";

// Pool of 10 budget/standard tier models - balanced for speed and reasoning
const MODEL_POOL = [
  // Budget tier - solid performers
  "openai/gpt-oss-20b",
  "qwen/qwen3-32b",
  "z-ai/glm-4.7",
  "meta-llama/llama-3.3-70b-instruct",
  "meta-llama/llama-4-scout",
  // Standard tier - proven reliable
  "deepseek/deepseek-chat-v3-0324",
  "google/gemini-2.5-flash",
  "openai/gpt-4o-mini",
  "mistralai/mixtral-8x7b-instruct",
  "x-ai/grok-3-mini",
  "meta-llama/llama-4-maverick",
];

// Pick 3 unique random models from the pool
const pickRandomModels = (): { agentA: string; agentB: string; agentC: string } => {
  const shuffled = [...MODEL_POOL].sort(() => Math.random() - 0.5);
  return {
    agentA: shuffled[0],
    agentB: shuffled[1],
    agentC: shuffled[2],
  };
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
  shuffleModels: () => void;
}

const ModelsContext = createContext<ModelsContextType | null>(null);

export const ModelsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [agentModels, setAgentModels] = useState(pickRandomModels);
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

  const shuffleModels = () => {
    setAgentModels(pickRandomModels());
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
        shuffleModels,
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
  shuffleModels: () => console.warn("[ModelsContext] shuffleModels called outside provider"),
};

export const useModelsContext = (): ModelsContextType => {
  const context = useContext(ModelsContext);
  if (!context) {
    console.warn("[ModelsContext] useModelsContext called outside ModelsProvider, using fallback");
    return fallbackContext;
  }
  return context;
};
