import React, { useEffect, useState, ChangeEvent } from 'react';
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
import { checkApiAvailability } from '@/utils/openRouter';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

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
  handleAgentAPersonaChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  handleAgentBPersonaChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  handleAgentCPersonaChange: (e: ChangeEvent<HTMLSelectElement>) => void;
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
  const [apiKeyWarning, setApiKeyWarning] = useState<string | null>(null);
  
  // Create adapter functions to convert between event handlers and string value handlers
  const handleAgentAPersonaChangeAdapter = (value: string) => {
    // Create a synthetic event object
    const syntheticEvent = {
      target: { value }
    } as ChangeEvent<HTMLSelectElement>;
    
    handleAgentAPersonaChange(syntheticEvent);
  };
  
  const handleAgentBPersonaChangeAdapter = (value: string) => {
    const syntheticEvent = {
      target: { value }
    } as ChangeEvent<HTMLSelectElement>;
    
    handleAgentBPersonaChange(syntheticEvent);
  };
  
  const handleAgentCPersonaChangeAdapter = (value: string) => {
    const syntheticEvent = {
      target: { value }
    } as ChangeEvent<HTMLSelectElement>;
    
    handleAgentCPersonaChange(syntheticEvent);
  };
  
  // Add effect to log when key props change
  useEffect(() => {
    console.log("AgentConfigSection props changed:", {
      savedApiKey: savedApiKey ? `${savedApiKey.substring(0, 8)}...` : null,
      agentAModel,
      agentBModel,
      agentCModel,
      numberOfAgents,
      loadingModels
    });
  }, [savedApiKey, agentAModel, agentBModel, agentCModel, numberOfAgents, loadingModels]);

  // Check for rate limit status in localStorage - this function is no longer needed with BYOK
  const checkForRateLimit = () => {
    // With BYOK approach, we don't need to check for rate limits
    // The user is responsible for their own API key and its rate limits
    return false;
  };

  // Get the current prompt
  const currentPrompt = getCurrentPrompt();
  console.log("Current prompt:", currentPrompt);

  // Add detailed debugging for API key and models
  const localStorageApiKey = localStorage.getItem('userOpenRouterApiKey');
  console.log("API Key Debug:", {
    savedApiKey: savedApiKey ? `${savedApiKey.substring(0, 8)}...` : null,
    savedApiKeyLength: savedApiKey ? savedApiKey.length : 0,
    localStorageApiKey: localStorageApiKey ? 
      `${localStorageApiKey.substring(0, 8)}...` : null
  });

  console.log("Models Debug:", {
    agentAModel,
    agentBModel,
    agentCModel,
    numberOfAgents,
    availableModelsCount: modelsByProvider ? 
      Object.values(modelsByProvider).reduce((acc, models) => acc + models.length, 0) : 0
  });

  // Simplified logic for button disabled state - with fallback to localStorage API key
  const isStartButtonDisabled = 
    loadingModels || 
    (!savedApiKey && !localStorageApiKey) || 
    !agentAModel || 
    (numberOfAgents >= 2 && !agentBModel) || 
    (numberOfAgents >= 3 && !agentCModel);
    
  // Debug logs for button disabled state
  console.log("Button disabled state:", {
    promptEmpty: !currentPrompt?.trim(),
    loadingModels: loadingModels,
    noApiKey: !savedApiKey && !localStorageApiKey,
    noAgentAModel: !agentAModel,
    agentBMissing: numberOfAgents >= 2 && !agentBModel,
    agentCMissing: numberOfAgents >= 3 && !agentCModel,
    finalState: isStartButtonDisabled
  });

  return (
    <>
      {apiKeyWarning && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>API Key Required</AlertTitle>
          <AlertDescription>
            {apiKeyWarning}
            <div className="mt-2">
              <button 
                onClick={() => goToStep(1)} 
                className="text-white underline hover:no-underline"
              >
                Go back to add your API key
              </button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    
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
        handleAgentAPersonaChange={handleAgentAPersonaChangeAdapter}
        handleAgentBPersonaChange={handleAgentBPersonaChangeAdapter}
        handleAgentCPersonaChange={handleAgentCPersonaChangeAdapter}
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
