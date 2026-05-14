import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CuratedModel, getEnabledModels } from "@/repositories/curatedModelsRepository";

// Fallback pool used only before curated models load (or if DB returns empty).
// Mixed snapshot from curated_models: open-weight + closed, multiple providers, varied tiers.
const FALLBACK_POOL = [
  "openai/gpt-4o-mini",
  "openai/gpt-oss-20b",
  "google/gemini-2.5-flash",
  "google/gemma-3-12b-it",
  "deepseek/deepseek-chat-v3-0324",
  "deepseek/deepseek-r1-distill-llama-70b",
  "meta-llama/llama-3.3-70b-instruct",
  "meta-llama/llama-4-scout",
  "qwen/qwen3-32b",
  "x-ai/grok-3-mini",
  "z-ai/glm-4.6",
  "mistralai/mistral-large-2411",
];

// Pick 3 unique random models from a given pool (falls back to FALLBACK_POOL if too few)
const pickRandomModels = (
  pool: string[] = FALLBACK_POOL
): { agentA: string; agentB: string; agentC: string } => {
  const source = pool.length >= 3 ? pool : FALLBACK_POOL;
  const shuffled = [...source].sort(() => Math.random() - 0.5);
  return {
    agentA: shuffled[0],
    agentB: shuffled[1],
    agentC: shuffled[2 % shuffled.length],
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

  // Load curated models from database, then re-shuffle from real enabled pool
  useEffect(() => {
    const loadModels = async () => {
      try {
        const models = await getEnabledModels();
        setAvailableModels(models);
        if (models.length >= 3) {
          // Re-pick from curated pool so initial selection reflects what admin enabled
          setAgentModels(pickRandomModels(models.map((m) => m.model_id)));
        }
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
    const pool = availableModels.map((m) => m.model_id);
    setAgentModels(pickRandomModels(pool));
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
