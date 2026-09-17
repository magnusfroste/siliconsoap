import React from "react";
import { AgentCard } from "../agent-card/AgentCard";
import { Profile, ModelsByProvider } from "../agent-card/types";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";

interface AgentGridSectionProps {
  numberOfAgents: number;
  setNumberOfAgents?: (count: number) => void;
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
  conversationTone?: "formal" | "casual" | "heated" | "collaborative";
  agreementBias?: number;
  temperature?: number;
  personalityIntensity?: "mild" | "moderate" | "extreme";
  onShuffleModels?: () => void;
}

export const AgentGridSection: React.FC<AgentGridSectionProps> = ({
  numberOfAgents,
  setNumberOfAgents,
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
  conversationTone,
  agreementBias,
  temperature,
  personalityIntensity,
  onShuffleModels,
}) => {
  return (
    <section className="min-w-0 max-w-full overflow-hidden space-y-5 rounded-lg border bg-card p-5 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">2</span><h2 className="font-display text-2xl font-semibold">Cast the agents</h2></div>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {setNumberOfAgents && <div className="flex rounded-md bg-muted p-1"><Button type="button" size="sm" variant={numberOfAgents === 2 ? 'default' : 'ghost'} onClick={() => setNumberOfAgents(2)}>2 agents</Button><Button type="button" size="sm" variant={numberOfAgents === 3 ? 'default' : 'ghost'} onClick={() => setNumberOfAgents(3)}>3 agents</Button></div>}
        {onShuffleModels && (
          <Button variant="outline" size="sm" onClick={onShuffleModels} className="h-8 gap-1.5" type="button">
            <Shuffle className="h-3.5 w-3.5" />
            Shuffle fast models
          </Button>
        )}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">Suggested cast: one fast open-weight model each from the European Union, the United States and China.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          borderColorClass="border-purple-200 dark:border-purple-700"
          iconBgClass="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
          conversationTone={conversationTone}
          agreementBias={agreementBias}
          temperature={temperature}
          personalityIntensity={personalityIntensity}
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
          borderColorClass="border-blue-200 dark:border-blue-700"
          iconBgClass="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
          conversationTone={conversationTone}
          agreementBias={agreementBias}
          temperature={temperature}
          personalityIntensity={personalityIntensity}
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
          borderColorClass="border-green-200 dark:border-green-700"
          iconBgClass="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
          conversationTone={conversationTone}
          agreementBias={agreementBias}
          temperature={temperature}
          personalityIntensity={personalityIntensity}
        />
      </div>
    </section>
  );
};
