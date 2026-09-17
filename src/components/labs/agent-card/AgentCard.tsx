
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AgentAvatar } from './AgentAvatar';
import { ModelSelector } from './ModelSelector';
import { AgentCardProps } from './types';
import { getAgentSoapName } from '@/pages/agents-meetup/utils/agentNameGenerator';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LicenseChip, OriginChip, SpeedChip } from '@/components/model-chips';

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
  iconBgClass,
}) => {
  const isDisabled = numberOfAgents < minAgents;

  // Get the current selected profile
  const selectedProfile = profiles.find(p => p.id === agentPersona);

  // While profiles are still loading (or the stored slug is not in the list yet),
  // don't hand Radix a value it cannot represent — it would emit onValueChange("")
  // and wipe a perfectly valid persona.
  const selectValue = selectedProfile ? agentPersona : undefined;
  const handleValueChange = (value: string) => {
    if (!value) return;
    handleAgentPersonaChange(value);
  };
  
  
  // Generate the soap opera name based on agent letter and persona
  const soapName = getAgentSoapName(`Agent ${agentLetter}`, agentPersona);
  
  return (
    <Card className={`rounded-md shadow-none ${isDisabled ? 'hidden' : ''}`}>
      <CardHeader className="pb-3 px-4 pt-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <AgentAvatar agentLetter={agentLetter} iconBgClass={iconBgClass} name={soapName} size="md" />
          <span>{soapName}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0 px-4 pb-4">
        <div className="space-y-2">
          <Label>Role</Label>
          <Select value={selectValue} onValueChange={handleValueChange} disabled={isDisabled}>
            <SelectTrigger><SelectValue placeholder="Choose a role" /></SelectTrigger>
            <SelectContent>{profiles.map((profile) => <SelectItem key={profile.id} value={profile.id}>{profile.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <ModelSelector 
          agentModel={agentModel}
          setAgentModel={setAgentModel}
          modelsByProvider={modelsByProvider}
          loadingModels={loadingModels}
          isDisabled={isDisabled}
        />
        
        {(() => {
          const models = Object.values(modelsByProvider).flat();
          const selected = models.find((model) => model.model_id === agentModel);
          return <div className="flex flex-wrap gap-1.5"><LicenseChip license={selected?.license_type} /><OriginChip origin={selected?.origin_region} /><SpeedChip speed={selected?.speed_rating} /></div>;
        })()}
      </CardContent>
    </Card>
  );
};

// Export types for external use
export * from './types';
