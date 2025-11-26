
import { useState } from 'react';
import { scenarioTypes } from '../constants';

export const useScenarios = () => {
  const [activeScenario, setActiveScenario] = useState('general-problem');
  const [promptInputs, setPromptInputs] = useState<{[key: string]: string}>({
    'general-problem': '',
    'ethical-dilemma': '',
    'future-prediction': ''
  });
  const [numberOfAgents, setNumberOfAgents] = useState(3);
  const [rounds, setRounds] = useState(2);
  const [responseLength, setResponseLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [participationMode, setParticipationMode] = useState<'spectator' | 'jump-in' | 'round-by-round'>('jump-in');
  
  // Expert settings
  const [conversationTone, setConversationTone] = useState<'formal' | 'casual' | 'heated' | 'collaborative'>('collaborative');
  const [agreementBias, setAgreementBias] = useState(50); // 0=always disagree, 100=always agree
  const [temperature, setTemperature] = useState(0.7);
  const [personalityIntensity, setPersonalityIntensity] = useState<'mild' | 'moderate' | 'extreme'>('moderate');

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
    participationMode,
    setParticipationMode,
    handleInputChange,
    // Expert settings
    conversationTone,
    setConversationTone,
    agreementBias,
    setAgreementBias,
    temperature,
    setTemperature,
    personalityIntensity,
    setPersonalityIntensity,
  };
};
