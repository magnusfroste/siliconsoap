
import { useState } from 'react';
import { scenarioTypes } from '../constants';

export const useScenarios = () => {
  const [activeScenario, setActiveScenario] = useState('general-problem');
  const [promptInputs, setPromptInputs] = useState<{[key: string]: string}>({
    'text-analysis': '',
    'ethical-dilemma': '',
    'future-prediction': '',
    'general-problem': ''
  });
  const [numberOfAgents, setNumberOfAgents] = useState(3);
  const [rounds, setRounds] = useState(2);
  const [responseLength, setResponseLength] = useState<'short' | 'medium' | 'long'>('medium');

  const handleInputChange = (scenarioId: string, value: string) => {
    setPromptInputs(prev => ({
      ...prev,
      [scenarioId]: value
    }));
  };

  return {
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
    handleInputChange,
  };
};
