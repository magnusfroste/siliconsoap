import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CuratedModel, getEnabledModels } from "@/repositories/curatedModelsRepository";

// Hardcoded curated models - no database dependency
const HARDCODED_MODELS: CuratedModel[] = [
  {
    id: "1",
    model_id: "meta-llama/llama-3.3-70b-instruct",
    display_name: "Llama 3.3 70B",
    provider: "Meta",
    is_enabled: true,
    is_free: false,
    sort_order: 1,
    default_for_agent: "A",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    description: "Meta's flagship open-weight model with strong reasoning",
    pros: ["Open-weight", "Strong reasoning", "Fast inference"],
    cons: ["Large model size"],
    use_cases: ["General conversation", "Analysis"],
    avoid_cases: [],
    category: "Large",
    context_window: 128000,
    speed_rating: "Fast",
  },
  {
    id: "2",
    model_id: "deepseek/deepseek-chat-v3-0324",
    display_name: "DeepSeek V3",
    provider: "DeepSeek",
    is_enabled: true,
    is_free: false,
    sort_order: 2,
    default_for_agent: "B",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    description: "DeepSeek's latest conversational AI model",
    pros: ["Cost effective", "Good reasoning"],
    cons: [],
    use_cases: ["Conversation", "Problem solving"],
    avoid_cases: [],
    category: "Large",
    context_window: 64000,
    speed_rating: "Fast",
  },
  {
    id: "3",
    model_id: "google/gemma-3-27b-it",
    display_name: "Gemma 3 27B",
    provider: "Google",
    is_enabled: true,
    is_free: false,
    sort_order: 3,
    default_for_agent: "C",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    description: "Google's efficient open model",
    pros: ["Efficient", "Good at instruction following"],
    cons: ["Smaller context"],
    use_cases: ["Creative writing", "Analysis"],
    avoid_cases: [],
    category: "Medium",
    context_window: 8192,
    speed_rating: "Fast",
  },
  {
    id: "4",
    model_id: "qwen/qwen-2.5-72b-instruct",
    display_name: "Qwen 2.5 72B",
    provider: "Alibaba",
    is_enabled: true,
    is_free: false,
    sort_order: 4,
    default_for_agent: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    description: "Alibaba's powerful instruction-following model",
    pros: ["Multilingual", "Strong reasoning"],
    cons: [],
    use_cases: ["Analysis", "Translation"],
    avoid_cases: [],
    category: "Large",
    context_window: 32000,
    speed_rating: "Medium",
  },
  {
    id: "5",
    model_id: "mistralai/mistral-large-2411",
    display_name: "Mistral Large",
    provider: "Mistral",
    is_enabled: true,
    is_free: false,
    sort_order: 5,
    default_for_agent: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    description: "Mistral's flagship large language model",
    pros: ["European AI", "Strong performance"],
    cons: [],
    use_cases: ["Conversation", "Writing"],
    avoid_cases: [],
    category: "Large",
    context_window: 128000,
    speed_rating: "Medium",
  },
];

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
  // Initialize with hardcoded defaults - these never change based on database
  const [agentModels, setAgentModels] = useState({
    agentA: "baidu/ernie-4.5-21b-a3b",
    agentB: "deepseek/deepseek-chat-v3-0324",
    agentC: "google/gemma-3-27b-it",
  });
  const [availableModels, setAvailableModels] = useState<CuratedModel[]>(HARDCODED_MODELS);
  const [loadingModels, setLoadingModels] = useState(true);

  // Load curated models from database
  useEffect(() => {
    const loadModels = async () => {
      try {
        const models = await getEnabledModels();
        if (models.length > 0) {
          setAvailableModels(models);
        }
        // If empty, keep HARDCODED_MODELS as fallback
      } catch (error) {
        console.error("Failed to load curated models:", error);
        // Keep HARDCODED_MODELS as fallback
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
