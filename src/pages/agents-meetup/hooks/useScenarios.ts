
import { useState, useEffect } from 'react';
import { scenarioTypes } from '../constants';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

export const useScenarios = () => {
  const { getNumericValue, getTextValue, loading } = useFeatureFlags();
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeScenario, setActiveScenario] = useState('general-problem');
  const [promptInputs, setPromptInputs] = useState<{[key: string]: string}>({
    'general-problem': '',
    'ethical-dilemma': '',
    'future-prediction': ''
  });
  const [numberOfAgents, setNumberOfAgents] = useState(3);
  const [rounds, setRounds] = useState(5); // Default 5 rounds
  const [responseLength, setResponseLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [participationMode, setParticipationMode] = useState<'spectator' | 'jump-in' | 'round-by-round'>('jump-in');
  const [turnOrder, setTurnOrder] = useState<'sequential' | 'random' | 'popcorn'>('sequential');
  
  // Expert settings
  const [conversationTone, setConversationTone] = useState<'formal' | 'casual' | 'heated' | 'collaborative'>('collaborative');
  const [agreementBias, setAgreementBias] = useState(50);
  const [temperature, setTemperature] = useState(0.7);
  const [personalityIntensity, setPersonalityIntensity] = useState<'mild' | 'moderate' | 'extreme'>('moderate');

  // Load defaults from feature flags only once
  useEffect(() => {
    if (!loading && !isInitialized) {
      const defaultAgents = getNumericValue('default_number_of_agents');
      const defaultRounds = getNumericValue('default_rounds');
      const defaultBias = getNumericValue('default_agreement_bias');
      const defaultTemp = getNumericValue('default_temperature');
      
      const defaultResponseLength = getTextValue('default_response_length') as 'short' | 'medium' | 'long' | null;
      const defaultParticipation = getTextValue('default_participation_mode') as 'spectator' | 'jump-in' | 'round-by-round' | null;
      const defaultTurnOrder = getTextValue('default_turn_order') as 'sequential' | 'random' | 'popcorn' | null;
      const defaultTone = getTextValue('default_conversation_tone') as 'formal' | 'casual' | 'heated' | 'collaborative' | null;
      const defaultIntensity = getTextValue('default_personality_intensity') as 'mild' | 'moderate' | 'extreme' | null;
      
      if (defaultAgents !== null) setNumberOfAgents(defaultAgents);
      if (defaultRounds !== null) setRounds(defaultRounds);
      if (defaultBias !== null) setAgreementBias(defaultBias);
      if (defaultTemp !== null) setTemperature(defaultTemp / 100);
      if (defaultResponseLength) setResponseLength(defaultResponseLength);
      if (defaultParticipation) setParticipationMode(defaultParticipation);
      if (defaultTurnOrder) setTurnOrder(defaultTurnOrder);
      if (defaultTone) setConversationTone(defaultTone);
      if (defaultIntensity) setPersonalityIntensity(defaultIntensity);
      
      setIsInitialized(true);
    }
  }, [loading, isInitialized]);

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
    turnOrder,
    setTurnOrder,
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
