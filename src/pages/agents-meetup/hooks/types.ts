// Re-export all types from the main types file
// This file exists for backward compatibility with existing imports

export type { 
  LabsState, 
  LabsActions,
  ResponseLength,
  ParticipationMode,
  TurnOrder,
  Profile,
  ScenarioType,
  ConversationMessage,
  AnalysisResults
} from '../types';

// Additional hook-specific types
import { ViewState } from './conversation/useConversationNavigation';
export type { ViewState };
