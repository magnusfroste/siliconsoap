
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export const useProfiles = () => {
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
