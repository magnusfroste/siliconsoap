import { useState, useCallback } from 'react';
import { useApiKey } from './useApiKey';
import { useModels } from './useModels';
import { useConversationFlow } from './useConversationFlow';
import { LabsState, LabsActions } from './types';
import { ConversationMessage, ResponseLength, ScenarioType } from '../types';
import { scenarioTypes } from '../constants';
import { fetchOpenRouterModels, findDefaultModel } from '@/utils/openRouter';
import { AGENT_A_PREFERRED_MODELS, AGENT_B_PREFERRED_MODELS, AGENT_C_PREFERRED_MODELS } from '@/utils/openRouter/models';
import { OpenRouterModel } from '@/utils/openRouter/types';
import { toast } from '@/hooks/use-toast';
import { useProfiles } from './useProfiles';
import { useScenarios } from './useScenarios';
import { getCurrentScenario, getCurrentPrompt, formatMessage } from './utils';
import React, { ChangeEvent } from 'react';

export const useLabsState = (): [LabsState, LabsActions] => {
  // Combine all the sub-hooks
  const {
    apiKey,
    setApiKey,
    savedApiKey,
    setSavedApiKey,
    userApiKey,
    setUserApiKey,
    isSaving,
    setIsSaving,
    isSaved,
    setIsSaved,
    isUsingEnvKey,
    isUsingSharedKey,
    saveApiKey: originalSaveApiKey,
    deleteApiKey: originalDeleteApiKey,
    validateApiKey,
    getActiveApiKey,
    promptForBYOK,
    enableSharedKeyMode
  } = useApiKey();

  // Create a wrapper around the saveApiKey function to trigger model loading
  const saveApiKey = async (key: string) => {
    // Call the original saveApiKey function
    originalSaveApiKey(key);
    
    // Force a refresh of the models
    console.log("Forcing model refresh after saving API key");
    setLoadingModels(true);
    
    // Add a small delay to ensure the API key is saved before fetching models
    setTimeout(async () => {
      try {
        const models = await fetchOpenRouterModels(key);
        console.log(`Loaded ${models.length} models after saving API key`);
        setAvailableModels(models);
      } catch (error) {
        console.error("Error loading models after saving API key:", error);
      } finally {
        setLoadingModels(false);
      }
    }, 500);
    
    return true;
  };

  // Create a wrapper around the deleteApiKey function to clear models
  const deleteApiKey = () => {
    originalDeleteApiKey();
    setAvailableModels([]);
  };

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
  } = useModels(getActiveApiKey()); // Use the active API key for fetching models

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
    handleAgentAPersonaChange: originalHandleAgentAPersonaChange,
    handleAgentBPersonaChange: originalHandleAgentBPersonaChange,
    handleAgentCPersonaChange: originalHandleAgentCPersonaChange
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
    handleInputChange
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
    savedApiKey,  // Use the saved API key directly
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
    getCurrentPromptFn
  );

  // Create wrapper functions to handle the event type mismatch
  const handleAgentAPersonaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    originalHandleAgentAPersonaChange(value);
  };

  const handleAgentBPersonaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    originalHandleAgentBPersonaChange(value);
  };

  const handleAgentCPersonaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    originalHandleAgentCPersonaChange(value);
  };

  return [
    {
      apiKey,
      savedApiKey,
      userApiKey, 
      isSaving,
      isSaved,
      isUsingEnvKey,
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
      analyzerModel
    },
    {
      setApiKey,
      setSavedApiKey,
      setUserApiKey,
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
      saveApiKey,
      deleteApiKey,
      validateApiKey,
      getActiveApiKey,
      handleStartConversation,
      handleAnalyzeConversation,
      handleAgentAPersonaChange,
      handleAgentBPersonaChange,
      handleAgentCPersonaChange,
      getCurrentScenario: getCurrentScenarioFn,
      getCurrentPrompt: getCurrentPromptFn,
      formatMessage,
      promptForBYOK,
      enableSharedKeyMode,
      refreshModels: async (apiKey: string) => {
        console.log("Refreshing models with API key:", apiKey ? `${apiKey.substring(0, 8)}...` : "none");
        setLoadingModels(true);
        try {
          const models = await fetchOpenRouterModels(apiKey);
          console.log("Refreshed models count:", models.length);
          console.log("First few models:", models.slice(0, 3));
          
          if (models.length === 0) {
            toast({
              title: "No Models Available",
              description: "Could not fetch models from OpenRouter. Please check your API key.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Models Refreshed",
              description: `Successfully loaded ${models.length} models from OpenRouter.`,
            });
            
            // Create modelsByProvider for debugging
            const modelsByProvider = models.reduce((acc, model) => {
              if (!acc[model.provider]) {
                acc[model.provider] = [];
              }
              acc[model.provider].push(model);
              return acc;
            }, {} as Record<string, any[]>);
            
            console.log("Models by provider:", Object.keys(modelsByProvider));
            console.log("Total providers:", Object.keys(modelsByProvider).length);
          }
          
          setAvailableModels(models);
          
          if (models.length > 0) {
            // Find default models for each agent based on their preferred models list
            const defaultAgentA = findDefaultModel(models, AGENT_A_PREFERRED_MODELS);
            const defaultAgentB = findDefaultModel(models, AGENT_B_PREFERRED_MODELS);
            const defaultAgentC = findDefaultModel(models, AGENT_C_PREFERRED_MODELS);
            
            // Set models independently
            if (defaultAgentA) setAgentAModel(defaultAgentA);
            if (defaultAgentB) setAgentBModel(defaultAgentB);
            if (defaultAgentC) setAgentCModel(defaultAgentC);
            
            // If any agent doesn't have a model selected, find the best available
            if (!defaultAgentA || !defaultAgentB || !defaultAgentC) {
              const findBestAlternative = (models: OpenRouterModel[]) => {
                // First try to find a free model
                const freeModel = models.find(m => m.isFree);
                if (freeModel) return freeModel.id;
                
                // Otherwise return first available model
                return models.length > 0 ? models[0].id : '';
              };
              
              if (!defaultAgentA) setAgentAModel(findBestAlternative(models));
              if (!defaultAgentB) setAgentBModel(findBestAlternative(models));
              if (!defaultAgentC) setAgentCModel(findBestAlternative(models));
            }
          }
        } catch (error) {
          console.error("Failed to refresh models:", error);
          toast({
            title: "Error Refreshing Models",
            description: "Failed to fetch models from OpenRouter. Please check your API key and try again.",
            variant: "destructive",
          });
        } finally {
          setLoadingModels(false);
        }
      }
    }
  ] as const;
};
