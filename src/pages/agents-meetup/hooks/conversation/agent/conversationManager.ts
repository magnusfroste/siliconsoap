// Re-export from services for backward compatibility
// Business logic has been moved to @/services/conversationService

export {
  checkBeforeStarting,
  validateConversationRequirements,
  handleInitialRound,
  handleAdditionalRounds,
  handleSingleRound,
  handleUserFollowUp
} from '@/services/conversationService';
