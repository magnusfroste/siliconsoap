
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Sparkles, Zap, Brain } from 'lucide-react';
import { AgentAvatar } from './AgentAvatar';
import { ModelSelector } from './ModelSelector';
import { ProfileSelector } from './ProfileSelector';
import { AgentCardProps } from './types';
import { getAgentSoapName } from '@/pages/agents-meetup/utils/agentNameGenerator';

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
  conversationTone,
  agreementBias,
  temperature,
  personalityIntensity
}) => {
  const isDisabled = numberOfAgents < minAgents;
  
  // Get the current selected profile
  const selectedProfile = profiles.find(p => p.id === agentPersona);
  
  // Determine which expert settings are active (non-default)
  const isHeatedTone = conversationTone === 'heated';
  const isFormalTone = conversationTone === 'formal';
  const isCasualTone = conversationTone === 'casual';
  const isHighCreativity = temperature !== undefined && temperature > 0.8;
  const isLowCreativity = temperature !== undefined && temperature < 0.3;
  const isDevilsAdvocate = agreementBias !== undefined && agreementBias < 30;
  const isYesAnd = agreementBias !== undefined && agreementBias > 70;
  const isExtremePersonality = personalityIntensity === 'extreme';
  const isMildPersonality = personalityIntensity === 'mild';
  
  const hasActiveSettings = isHeatedTone || isFormalTone || isCasualTone || 
                            isHighCreativity || isLowCreativity || 
                            isDevilsAdvocate || isYesAnd || 
                            isExtremePersonality || isMildPersonality;
  
  // Generate the soap opera name based on agent letter and persona
  const soapName = getAgentSoapName(`Agent ${agentLetter}`, agentPersona);
  
  return (
    <Card className={`border-2 ${borderColorClass} shadow-md ${isDisabled ? 'opacity-50' : ''}`}>
      <CardHeader className="pb-2 px-3 pt-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <AgentAvatar agentLetter={agentLetter} iconBgClass={iconBgClass} />
          <span>{soapName}</span>
          <span className="text-xs text-muted-foreground font-normal">({agentLetter})</span>
          {isDisabled && <span className="text-xs text-muted-foreground ml-2">(Disabled)</span>}
        </CardTitle>
        
        {/* Expert Settings Badges */}
        {hasActiveSettings && !isDisabled && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {isHeatedTone && (
              <Badge variant="outline" className="text-xs gap-1 border-orange-500/50 bg-orange-500/10 text-orange-700 dark:text-orange-400">
                <Flame className="h-3 w-3" />
                Heated
              </Badge>
            )}
            {isFormalTone && (
              <Badge variant="outline" className="text-xs gap-1 border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400">
                🎓 Formal
              </Badge>
            )}
            {isCasualTone && (
              <Badge variant="outline" className="text-xs gap-1 border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400">
                ☕ Casual
              </Badge>
            )}
            {isHighCreativity && (
              <Badge variant="outline" className="text-xs gap-1 border-purple-500/50 bg-purple-500/10 text-purple-700 dark:text-purple-400">
                <Sparkles className="h-3 w-3" />
                Wild Card
              </Badge>
            )}
            {isLowCreativity && (
              <Badge variant="outline" className="text-xs gap-1 border-gray-500/50 bg-gray-500/10 text-gray-700 dark:text-gray-400">
                <Brain className="h-3 w-3" />
                By the Book
              </Badge>
            )}
            {isDevilsAdvocate && (
              <Badge variant="outline" className="text-xs gap-1 border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400">
                <Zap className="h-3 w-3" />
                Devil's Advocate
              </Badge>
            )}
            {isYesAnd && (
              <Badge variant="outline" className="text-xs gap-1 border-teal-500/50 bg-teal-500/10 text-teal-700 dark:text-teal-400">
                ✨ Yes, And!
              </Badge>
            )}
            {isExtremePersonality && (
              <Badge variant="outline" className="text-xs gap-1 border-pink-500/50 bg-pink-500/10 text-pink-700 dark:text-pink-400">
                Extreme Persona
              </Badge>
            )}
            {isMildPersonality && (
              <Badge variant="outline" className="text-xs gap-1 border-slate-500/50 bg-slate-500/10 text-slate-700 dark:text-slate-400">
                Mild Persona
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3 pt-0 px-3 pb-3">
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
