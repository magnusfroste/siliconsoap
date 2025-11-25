
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AgentAvatar } from './AgentAvatar';
import { ModelSelector } from './ModelSelector';
import { ProfileSelector } from './ProfileSelector';
import { AgentCardProps } from './types';

export const AgentCard: React.FC<AgentCardProps> = ({
  agentLetter,
  agentModel,
  setAgentModel,
  agentPersona,
  handleAgentPersonaChange,
  profiles,
  form,
  modelsByProvider,
  loadingModels,
  numberOfAgents,
  minAgents,
  borderColorClass,
  iconBgClass,
}) => {
  const isDisabled = numberOfAgents < minAgents;
  
  // Get the current selected profile
  const selectedProfile = profiles.find(p => p.id === agentPersona);
  
  return (
    <Card className={`border-2 ${borderColorClass} shadow-md ${isDisabled ? 'opacity-50' : ''}`}>
      <CardHeader className="pb-2 px-4 pt-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <AgentAvatar agentLetter={agentLetter} iconBgClass={iconBgClass} />
          Agent {agentLetter}
          {isDisabled && <span className="text-xs text-gray-500 ml-2">(Disabled)</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0 px-4 pb-3">
        <ModelSelector 
          agentModel={agentModel}
          setAgentModel={setAgentModel}
          modelsByProvider={modelsByProvider}
          loadingModels={loadingModels}
          isDisabled={isDisabled}
        />
        
        <ProfileSelector 
          form={form}
          agentPersona={agentPersona}
          handleAgentPersonaChange={handleAgentPersonaChange}
          profiles={profiles}
          isDisabled={isDisabled}
          borderColorClass={borderColorClass}
          selectedProfile={selectedProfile}
        />
      </CardContent>
    </Card>
  );
};

// Export types for external use
export * from './types';
