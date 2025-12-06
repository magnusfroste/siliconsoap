import { useCallback } from 'react';
import { useApiKey } from './useApiKey';
import { useModels } from './useModels';
import { useConversationFlow } from './useConversationFlow';
import { LabsState, LabsActions } from './types';
import { ScenarioType } from '../types';
import { scenarioTypes } from '../constants';
import { getEnabledModels, CuratedModel } from '@/repositories/curatedModelsRepository';
import { toast } from '@/hooks/use-toast';
import { useProfiles } from './useProfiles';
import { useScenarios } from './useScenarios';
import { getCurrentScenario, getCurrentPrompt, formatMessage } from './utils';

export const useLabsState = (): [LabsState, LabsActions] => {
  // Simplified API key hook - always uses shared key
  const {
    apiKey,
    setApiKey,
    savedApiKey,
    setSavedApiKey,
    isSaving,
    setIsSaving,
    isSaved,
    setIsSaved,
    isUsingSharedKey,
    getActiveApiKey,
    enableSharedKeyMode
  } = useApiKey();

  const {
    agentAModel,
    setAgentAModel,
    agentBModel,
    setAgentBModel,
    agentCModel,
    setAgentCModel,
    availableModels,
    setAvailableModels,
    loadingModels,
    setLoadingModels
  } = useModels(getActiveApiKey());

  const {
    agentAPersona,
    setAgentAPersona,
    agentBPersona,
    setAgentBPersona,
    agentCPersona,
    setAgentCPersona,
    formA,
    formB,
    formC,
    handleAgentAPersonaChange,
    handleAgentBPersonaChange,
    handleAgentCPersonaChange
  } = useProfiles();

  const {
    activeScenario,
    setActiveScenario,
    promptInputs,
    setPromptInputs,
    numberOfAgents,
    setNumberOfAgents,
    rounds,
    setRounds,
    responseLength,
    setResponseLength,
    participationMode,
    setParticipationMode,
    turnOrder,
    setTurnOrder,
    handleInputChange,
    conversationTone,
    setConversationTone,
    agreementBias,
    setAgreementBias,
    temperature,
    setTemperature,
    personalityIntensity,
    setPersonalityIntensity,
  } = useScenarios();

  // Functions that need to be passed to useConversationFlow
  const getCurrentScenarioFn = (): ScenarioType => {
    return getCurrentScenario(scenarioTypes, activeScenario);
  };

  const getCurrentPromptFn = (): string => {
    return getCurrentPrompt(promptInputs, activeScenario);
  };

  const {
    conversation,
    setConversation,
    isLoading,
    setIsLoading,
    currentView,
    setCurrentView,
    settingsOpen,
    setSettingsOpen,
    isAnalyzing,
    setIsAnalyzing,
    analysisResults,
    setAnalysisResults,
    analyzerModel,
    setAnalyzerModel,
    handleStartConversation,
    handleAnalyzeConversation
  } = useConversationFlow(
    savedApiKey,
    agentAModel,
    agentBModel,
    agentCModel,
    agentAPersona,
    agentBPersona,
    agentCPersona,
    numberOfAgents,
    rounds,
    responseLength,
    getCurrentScenarioFn,
    getCurrentPromptFn,
    turnOrder
  );

  return [
    {
      apiKey,
      savedApiKey,
      isSaving,
      isSaved,
      isUsingSharedKey,
      agentAModel,
      agentBModel,
      agentCModel,
      agentAPersona,
      agentBPersona,
      agentCPersona,
      rounds,
      numberOfAgents,
      responseLength,
      participationMode,
      turnOrder,
      conversation,
      isLoading,
      availableModels,
      loadingModels,
      currentView,
      settingsOpen,
      activeScenario,
      promptInputs,
      isAnalyzing,
      analysisResults,
      analyzerModel,
      formA,
      formB,
      formC,
      conversationTone,
      agreementBias,
      temperature,
      personalityIntensity,
    },
    {
      setApiKey,
      setSavedApiKey,
      setIsSaving,
      setIsSaved,
      setAgentAModel,
      setAgentBModel,
      setAgentCModel,
      setAgentAPersona,
      setAgentBPersona,
      setAgentCPersona,
      setRounds,
      setNumberOfAgents,
      setResponseLength,
      setParticipationMode,
      setTurnOrder,
      setConversation,
      setIsLoading,
      setAvailableModels,
      setLoadingModels,
      setCurrentView,
      setSettingsOpen,
      setActiveScenario,
      setPromptInputs,
      setIsAnalyzing,
      setAnalysisResults,
      setAnalyzerModel,
      handleInputChange,
      getActiveApiKey,
      handleStartConversation,
      handleAnalyzeConversation,
      handleAgentAPersonaChange,
      handleAgentBPersonaChange,
      handleAgentCPersonaChange,
      getCurrentScenario: getCurrentScenarioFn,
      getCurrentPrompt: getCurrentPromptFn,
      formatMessage,
      enableSharedKeyMode,
      setConversationTone,
      setAgreementBias,
      setTemperature,
      setPersonalityIntensity,
      refreshModels: async () => {
        setLoadingModels(true);
        try {
          const models = await getEnabledModels();
          
          if (models.length === 0) {
            toast({
              title: "No Models Available",
              description: "No curated models configured.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Models Refreshed",
              description: `Successfully loaded ${models.length} curated models.`,
            });
          }
          
          setAvailableModels(models);
          
          if (models.length > 0) {
            const findBestAlternative = (models: CuratedModel[]) => {
              const freeModel = models.find(m => m.is_free);
              return freeModel?.model_id || models[0]?.model_id || '';
            };
            
            // Set to first available curated model as fallback
            const bestModel = findBestAlternative(models);
            if (!agentAModel || !models.some(m => m.model_id === agentAModel)) {
              setAgentAModel(bestModel);
            }
            if (!agentBModel || !models.some(m => m.model_id === agentBModel)) {
              setAgentBModel(bestModel);
            }
            if (!agentCModel || !models.some(m => m.model_id === agentCModel)) {
              setAgentCModel(bestModel);
            }
          }
        } catch (error) {
          console.error("Failed to refresh curated models:", error);
          toast({
            title: "Error Refreshing Models",
            description: "Failed to fetch models. Please try again.",
            variant: "destructive",
          });
        } finally {
          setLoadingModels(false);
        }
      }
    }
  ] as const;
};
