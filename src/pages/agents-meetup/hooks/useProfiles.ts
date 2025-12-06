import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

export const useProfiles = () => {
  const { getTextValue, loading } = useFeatureFlags();
  
  const isInitialized = useRef(false);
  const [agentAPersona, setAgentAPersona] = useState('analytical');
  const [agentBPersona, setAgentBPersona] = useState('creative');
  const [agentCPersona, setAgentCPersona] = useState('strategic');

  const formA = useForm({
    defaultValues: { persona: 'analytical' }
  });

  const formB = useForm({
    defaultValues: { persona: 'creative' }
  });

  const formC = useForm({
    defaultValues: { persona: 'strategic' }
  });

  // Load defaults from feature flags only once
  useEffect(() => {
    if (loading || isInitialized.current) return;
    
    const defaultAgentA = getTextValue('default_profile_agent_a');
    const defaultAgentB = getTextValue('default_profile_agent_b');
    const defaultAgentC = getTextValue('default_profile_agent_c');
    
    if (defaultAgentA) {
      setAgentAPersona(defaultAgentA);
      formA.setValue('persona', defaultAgentA);
    }
    if (defaultAgentB) {
      setAgentBPersona(defaultAgentB);
      formB.setValue('persona', defaultAgentB);
    }
    if (defaultAgentC) {
      setAgentCPersona(defaultAgentC);
      formC.setValue('persona', defaultAgentC);
    }
    
    isInitialized.current = true;
  }, [loading, getTextValue, formA, formB, formC]);

  const handleAgentAPersonaChange = useCallback((value: string) => {
    setAgentAPersona(value);
    formA.setValue('persona', value);
  }, [formA]);

  const handleAgentBPersonaChange = useCallback((value: string) => {
    setAgentBPersona(value);
    formB.setValue('persona', value);
  }, [formB]);
  
  const handleAgentCPersonaChange = useCallback((value: string) => {
    setAgentCPersona(value);
    formC.setValue('persona', value);
  }, [formC]);

  return {
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
  };
};
