
import React from 'react';
import { AgentCard } from './agent-card/AgentCard';
import { Profile } from './agent-card/types';
import { UseFormReturn } from 'react-hook-form';

interface AgentGridSectionProps {
  numberOfAgents: number;
  agentAModel: string;
  setAgentAModel: (model: string) => void;
  agentBModel: string;
  setAgentBModel: (model: string) => void;
  agentCModel: string;
  setAgentCModel: (model: string) => void;
  agentAPersona: string;
  agentBPersona: string;
  agentCPersona: string;
  handleAgentAPersonaChange: (value: string) => void;
  handleAgentBPersonaChange: (value: string) => void;
  handleAgentCPersonaChange: (value: string) => void;
  profiles: Profile[];
  formA: UseFormReturn<{ persona: string }>;
  formB: UseFormReturn<{ persona: string }>;
  formC: UseFormReturn<{ persona: string }>;
  modelsByProvider: Record<string, any[]>;
  loadingModels: boolean;
}

export const AgentGridSection: React.FC<AgentGridSectionProps> = ({
  numberOfAgents,
  agentAModel,
  setAgentAModel,
  agentBModel,
  setAgentBModel,
  agentCModel,
  setAgentCModel,
  agentAPersona,
  agentBPersona,
  agentCPersona,
  handleAgentAPersonaChange,
  handleAgentBPersonaChange,
  handleAgentCPersonaChange,
  profiles,
  formA,
  formB,
  formC,
  modelsByProvider,
  loadingModels,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <AgentCard
        agentLetter="A"
        agentModel={agentAModel}
        setAgentModel={setAgentAModel}
        agentPersona={agentAPersona}
        handleAgentPersonaChange={handleAgentAPersonaChange}
        profiles={profiles}
        form={formA}
        modelsByProvider={modelsByProvider}
        loadingModels={loadingModels}
        numberOfAgents={numberOfAgents}
        minAgents={1}
        borderColorClass="border-purple-200"
        iconBgClass="bg-purple-100 text-purple-600"
      />

      <AgentCard
        agentLetter="B"
        agentModel={agentBModel}
        setAgentModel={setAgentBModel}
        agentPersona={agentBPersona}
        handleAgentPersonaChange={handleAgentBPersonaChange}
        profiles={profiles}
        form={formB}
        modelsByProvider={modelsByProvider}
        loadingModels={loadingModels}
        numberOfAgents={numberOfAgents}
        minAgents={2}
        borderColorClass="border-blue-200"
        iconBgClass="bg-blue-100 text-blue-600"
      />
      
      <AgentCard
        agentLetter="C"
        agentModel={agentCModel}
        setAgentModel={setAgentCModel}
        agentPersona={agentCPersona}
        handleAgentPersonaChange={handleAgentCPersonaChange}
        profiles={profiles}
        form={formC}
        modelsByProvider={modelsByProvider}
        loadingModels={loadingModels}
        numberOfAgents={numberOfAgents}
        minAgents={3}
        borderColorClass="border-green-200"
        iconBgClass="bg-green-100 text-green-600"
      />
    </div>
  );
};
