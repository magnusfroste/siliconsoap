
import { useState } from 'react';
import { scenarioTypes } from '../constants';
import { useApiKey } from './useApiKey';
import { useModels } from './useModels';
import { useProfiles } from './useProfiles';
import { useScenarios } from './useScenarios';
import { useConversationFlow } from './useConversationFlow';
import { getCurrentScenario, getCurrentPrompt, formatMessage } from './utils';
import { LabsState, LabsActions } from './types';
import { ResponseLength, ScenarioType } from '../types';

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
    saveApiKey,
    getActiveApiKey
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
  } = useModels(savedApiKey);

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
    currentStep,
    setCurrentStep,
    isAnalyzing,
    setIsAnalyzing,
    analysisResults,
    setAnalysisResults,
    analyzerModel,
    setAnalyzerModel,
    goToStep,
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
    userApiKey
  );

  return [
    {
      apiKey,
      savedApiKey,
      userApiKey, 
      isSaving,
      isSaved,
      isUsingEnvKey,
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
      currentStep,
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
      setCurrentStep,
      setActiveScenario,
      setPromptInputs,
      setIsAnalyzing,
      setAnalysisResults,
      setAnalyzerModel,
      handleInputChange,
      saveApiKey,
      getActiveApiKey,
      goToStep,
      handleStartConversation,
      handleAnalyzeConversation,
      handleAgentAPersonaChange,
      handleAgentBPersonaChange,
      handleAgentCPersonaChange,
      getCurrentScenario: getCurrentScenarioFn,
      getCurrentPrompt: getCurrentPromptFn,
      formatMessage
    }
  ];
};
