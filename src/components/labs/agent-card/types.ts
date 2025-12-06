
import { UseFormReturn } from 'react-hook-form';
import { ReactNode } from 'react';
import { CuratedModel } from '@/repositories/curatedModelsRepository';

export type Profile = {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  instructions?: string;
};

export type ModelsByProvider = Record<string, CuratedModel[]>;

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
  conversationTone?: 'formal' | 'casual' | 'heated' | 'collaborative';
  agreementBias?: number;
  temperature?: number;
  personalityIntensity?: 'mild' | 'moderate' | 'extreme';
}
