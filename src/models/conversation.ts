// Conversation domain types

import { ReactNode } from 'react';

export type ResponseLength = 'short' | 'medium' | 'long';
export type ParticipationMode = 'spectator' | 'jump-in' | 'round-by-round';
export type TurnOrder = 'sequential' | 'random' | 'popcorn';
export type ConversationTone = 'formal' | 'casual' | 'heated' | 'collaborative';
export type PersonalityIntensity = 'mild' | 'moderate' | 'extreme';

export interface ConversationMessage {
  agent: string;
  message: string;
  model: string;
  persona: string;
  isHuman?: boolean;
  fallbackUsed?: boolean;
  originalModel?: string;
}

export interface AnalysisResults {
  agentContributions: Record<string, number>;
  topicCoverage: number;
  novelInsights: string[];
  overallScore: number;
  summary: string;
}

export interface Profile {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  instructions?: string;
}

export interface ScenarioType {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  promptTemplate: (text: string) => string;
  followupTemplate: (text: string, prevResponse: string, otherResponse: string) => string;
  finalTemplate: (text: string, prevResponse: string, otherResponse: string) => string;
  placeholder: string;
}
