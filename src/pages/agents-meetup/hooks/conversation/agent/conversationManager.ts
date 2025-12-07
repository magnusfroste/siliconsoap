// Re-export from services for backward compatibility
// Business logic has been moved to @/services/conversationService

export {
  checkBeforeStarting,
  validateConversationRequirements,
  handleInitialRound,
  handleAdditionalRounds,
  handleUserFollowUp
} from '@/services/conversationService';
