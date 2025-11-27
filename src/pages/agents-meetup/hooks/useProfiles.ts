
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

export const useProfiles = () => {
  const { getTextValue, loading } = useFeatureFlags();
  
  const [agentAPersona, setAgentAPersona] = useState('analytical-expert');
  const [agentBPersona, setAgentBPersona] = useState('creative-thinker');
  const [agentCPersona, setAgentCPersona] = useState('strategic-planner');

  // Load defaults from feature flags
  useEffect(() => {
    if (!loading) {
      const defaultAgents = getTextValue('default_agents');
      if (defaultAgents) {
        const slugs = defaultAgents.split(',').map(s => s.trim());
        if (slugs[0]) setAgentAPersona(slugs[0]);
        if (slugs[1]) setAgentBPersona(slugs[1]);
        if (slugs[2]) setAgentCPersona(slugs[2]);
      }
    }
  }, [loading, getTextValue]);

  const formA = useForm({
    defaultValues: { persona: 'analytical-expert' }
  });

  const formB = useForm({
    defaultValues: { persona: 'creative-thinker' }
  });

  const formC = useForm({
    defaultValues: { persona: 'strategic-planner' }
  });

  const handleAgentAPersonaChange = (value: string) => {
    setAgentAPersona(value);
    formA.setValue('persona', value);
  };

  const handleAgentBPersonaChange = (value: string) => {
    setAgentBPersona(value);
    formB.setValue('persona', value);
  };
  
  const handleAgentCPersonaChange = (value: string) => {
    setAgentCPersona(value);
    formC.setValue('persona', value);
  };

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
