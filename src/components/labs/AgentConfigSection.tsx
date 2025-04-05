import React from 'react';
import { CardFooter } from '@/components/ui/card';
import { ScenarioSelector, ScenarioType } from './ScenarioSelector';
import { UseFormReturn } from 'react-hook-form';
import { 
  ConversationSettings, 
  SettingsCard, 
  AgentConfigFooter,
  AgentGridSection
} from './agent-config';
import { Profile } from './agent-card/types';

interface AgentConfigSectionProps {
  numberOfAgents: number;
  setNumberOfAgents: (num: number) => void;
  rounds: number;
  setRounds: (num: number) => void;
  responseLength: string;
  setResponseLength: (length: string) => void;
  responseLengthOptions: { value: string; label: string; icon: React.ReactNode }[];
  scenarioTypes: ScenarioType[];
  activeScenario: string;
  setActiveScenario: (scenario: string) => void;
  promptInputs: Record<string, string>;
  handleInputChange: (scenarioId: string, value: string) => void;
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
  goToStep: (step: number) => void;
  handleStartConversation: () => void;
  isLoading: boolean;
  getCurrentPrompt: () => string;
  savedApiKey: string;
}

export const AgentConfigSection: React.FC<AgentConfigSectionProps> = ({
  numberOfAgents,
  setNumberOfAgents,
  rounds,
  setRounds,
  responseLength,
  setResponseLength,
  responseLengthOptions,
  scenarioTypes,
  activeScenario,
  setActiveScenario,
  promptInputs,
  handleInputChange,
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
  goToStep,
  handleStartConversation,
  isLoading,
  getCurrentPrompt,
  savedApiKey
}) => {
  const isStartButtonDisabled = !getCurrentPrompt().trim() || 
    loadingModels || 
    !savedApiKey || 
    !agentAModel || 
    (numberOfAgents >= 2 && !agentBModel) || 
    (numberOfAgents >= 3 && !agentCModel);

  return (
    <>
      <SettingsCard title="Conversation Settings">
        <ConversationSettings
          numberOfAgents={numberOfAgents}
          setNumberOfAgents={setNumberOfAgents}
          rounds={rounds}
          setRounds={setRounds}
          responseLength={responseLength}
          setResponseLength={setResponseLength}
          responseLengthOptions={responseLengthOptions}
        />
        
        <ScenarioSelector 
          scenarioTypes={scenarioTypes}
          activeScenario={activeScenario}
          setActiveScenario={setActiveScenario}
          promptInputs={promptInputs}
          handleInputChange={handleInputChange}
        />
      </SettingsCard>
      
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

      <CardFooter className="p-0">
        <AgentConfigFooter
          goToStep={goToStep}
          handleStartConversation={handleStartConversation}
          isLoading={isLoading}
          isDisabled={isStartButtonDisabled}
        />
      </CardFooter>
    </>
  );
};
