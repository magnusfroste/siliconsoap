
import { ResponseLength, ScenarioType } from '../types';

export const formatMessage = (text: string) => {
  if (!text) return "";
  
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formattedText = formattedText.replace(/__(.*?)__/g, '<strong>$1</strong>');
  
  formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
  formattedText = formattedText.replace(/_(.*?)_/g, '<em>$1</em>');
  
  formattedText = formattedText.replace(/\n/g, '<br/>');
  
  return formattedText;
};

export const getCurrentScenario = (
  scenarioTypes: ScenarioType[],
  activeScenario: string
): ScenarioType => {
  return scenarioTypes.find(s => s.id === activeScenario) || scenarioTypes[0];
};

export const getCurrentPrompt = (
  promptInputs: {[key: string]: string},
  activeScenario: string
): string => {
  return promptInputs[activeScenario] || '';
};

export const getModelDisplayName = (modelId: string, availableModels: any[]): string => {
  const model = availableModels.find(m => m.id === modelId);
  return model ? model.name : modelId.split('/').pop() || modelId;
};
