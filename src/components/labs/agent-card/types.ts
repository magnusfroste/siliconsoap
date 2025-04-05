
import { UseFormReturn } from 'react-hook-form';
import { ReactNode } from 'react';

export type Profile = {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  instructions?: string;
};

export type ModelsByProvider = Record<string, {
  id: string;
  name: string;
  provider: string;
  description?: string;
  isFree?: boolean;
}[]>;

export interface AgentCardProps {
  agentLetter: 'A' | 'B' | 'C';
  agentModel: string;
  setAgentModel: (model: string) => void;
  agentPersona: string;
  handleAgentPersonaChange: (value: string) => void;
  profiles: Profile[];
  form: UseFormReturn<{ persona: string }>;
  modelsByProvider: ModelsByProvider;
  loadingModels: boolean;
  numberOfAgents: number;
  minAgents: number;
  borderColorClass: string;
  iconBgClass: string;
}
