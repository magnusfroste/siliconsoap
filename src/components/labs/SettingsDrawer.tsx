import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { UseFormReturn } from 'react-hook-form';
import { ConversationSettings, AgentGridSection } from './agent-config';
import { Profile, ModelsByProvider } from './agent-card/types';

interface SettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  numberOfAgents: number;
  setNumberOfAgents: (num: number) => void;
  rounds: number;
  setRounds: (num: number) => void;
  responseLength: string;
  setResponseLength: (length: string) => void;
  participationMode: string;
  setParticipationMode: (mode: string) => void;
  turnOrder: string;
  setTurnOrder: (order: string) => void;
  responseLengthOptions: { value: string; label: string; icon: React.ReactNode }[];
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
  modelsByProvider: ModelsByProvider;
  loadingModels: boolean;
  isUsingSharedKey: boolean;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  open,
  onOpenChange,
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
  responseLengthOptions,
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
  isUsingSharedKey
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Conversation Settings</SheetTitle>
          <SheetDescription>
            Customize agent behavior, models, and conversation parameters
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* API Access Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">API Access</h3>
              <Badge variant="secondary" className="text-xs">
                Shared API
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Conversation Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Conversation Parameters</h3>
            <ConversationSettings
              numberOfAgents={numberOfAgents}
              setNumberOfAgents={setNumberOfAgents}
              rounds={rounds}
              setRounds={setRounds}
              responseLength={responseLength}
              setResponseLength={setResponseLength}
              participationMode={participationMode}
              setParticipationMode={setParticipationMode}
              turnOrder={turnOrder}
              setTurnOrder={setTurnOrder}
              responseLengthOptions={responseLengthOptions}
            />
          </div>

          <Separator />

          {/* Agent Configuration */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Agent Configuration</h3>
            <AgentGridSection
              numberOfAgents={numberOfAgents}
              agentAModel={agentAModel}
              setAgentAModel={setAgentAModel}
              agentBModel={agentBModel}
              setAgentBModel={setAgentBModel}
              agentCModel={agentCModel}
              setAgentCModel={setAgentCModel}
              agentAPersona={agentAPersona}
              agentBPersona={agentBPersona}
              agentCPersona={agentCPersona}
              handleAgentAPersonaChange={handleAgentAPersonaChange}
              handleAgentBPersonaChange={handleAgentBPersonaChange}
              handleAgentCPersonaChange={handleAgentCPersonaChange}
              profiles={profiles}
              formA={formA}
              formB={formB}
              formC={formC}
              modelsByProvider={modelsByProvider}
              loadingModels={loadingModels}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
