import { useParams } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '../components/ChatMessage';
import { UserMessage } from '../components/UserMessage';
import { RoundSeparator } from '../components/RoundSeparator';
import { AgentTypingIndicator } from '../components/AgentTypingIndicator';
import { ChatInput } from '../components/ChatInput';
import { RoundPausePrompt } from '../components/RoundPausePrompt';
import { ConversationComplete } from '../components/ConversationComplete';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';
import { useLabsState } from '../hooks/useLabsState';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { Loader2, Share2, Eye, MessageSquare, Users, Flame, Handshake, GraduationCap, Coffee, Zap, Scale } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { handleInitialRound, handleAdditionalRounds, handleSingleRound, checkBeforeStarting, handleUserFollowUp, TokenUsageCallback, ExpertSettings } from '@/services/conversationService';
import { useCredits } from '../hooks/useCredits';
import { creditsService } from '@/services';
import { toast } from 'sonner';
import { ConversationMessage, TokenUsage } from '@/models';
import { scenarioTypes } from '../constants';
import { FloatingActionBar } from '../components/FloatingActionBar';
import { AnalysisDrawer } from '../components/AnalysisDrawer';
import { useConversationAnalysis } from '../hooks/conversation/useConversationAnalysis';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useConversationPlayback } from '../hooks/useConversationPlayback';
import { analyticsService } from '@/services';

export const ChatView = () => {
  const { chatId } = useParams();
  const { user } = useAuth();
  const { chat, messages, loading, saveMessage, setMessages, shareChat } = useChat(chatId, user?.id);
  const [state] = useLabsState();
  const { isEnabled } = useFeatureFlags();
  const { hasCredits, creditsRemaining, refreshCredits, loading: creditsLoading } = useCredits(user?.id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<string | null>(null);
  const [showAnalysisDrawer, setShowAnalysisDrawer] = useState(false);
  const [currentRoundInProgress, setCurrentRoundInProgress] = useState(1);
  const [waitingForUserInput, setWaitingForUserInput] = useState(false);
  const [conversationComplete, setConversationComplete] = useState(false);
  const [wantsToContinue, setWantsToContinue] = useState(false);
  
  // Refs to prevent race conditions
  const hasStartedGeneration = useRef(false);
  const isMounted = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const generationStartTime = useRef<number | null>(null);
  
  const audioPlaybackEnabled = isEnabled('enable_audio_playback');
  
  // Get saved analysis from chat settings
  const savedAnalysis = (chat?.settings as any)?.analysisResults;
  const savedAnalyzerModel = (chat?.settings as any)?.analysisModel;

  const {
    isAnalyzing,
    analysisResults,
    handleAnalyzeConversation,
    isSaved: isAnalysisSaved
  } = useConversationAnalysis(
    state.apiKey, 
    messages, 
    chatId, 
    chat?.share_id || undefined,
    savedAnalysis,
    savedAnalyzerModel
  );

  const {
    isPlaying,
    isPaused,
    currentMessageIndex,
    isGenerating: isGeneratingAudio,
    play,
    pause,
    stop
  } = useConversationPlayback(messages);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const isGuest = !user;

  // Auto-scroll to current playing message
  useEffect(() => {
    if (isPlaying && currentMessageIndex >= 0 && scrollAreaRef.current) {
      const messageElements = scrollAreaRef.current.querySelectorAll('[data-message-index]');
      const currentElement = messageElements[currentMessageIndex];
      if (currentElement) {
        currentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentMessageIndex, isPlaying]);

  // Handle share button click
  const handleShareClick = async () => {
    if (!chatId || isGuest) {
      toast.error('You must be logged in to share chats');
      return;
    }

    const shareId = await shareChat(chatId);
    if (shareId) {
      const shareUrl = `${window.location.origin}/shared/${shareId}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied! Anyone with the link can view this chat.');
    }
  };

  // Detect if chat is already complete when loading
  useEffect(() => {
    if (!chat || loading || messages.length === 0) return;
    
    const settings = chat.settings as any;
    const numberOfAgents = settings?.numberOfAgents || 2;
    const configuredRounds = settings?.rounds || 1;
    const participationMode = settings?.participationMode || 'jump-in';
    
    // Calculate actual rounds from messages (excluding human messages for agent round counting)
    const agentMessages = messages.filter(m => !m.isHuman);
    const actualRounds = Math.ceil(agentMessages.length / numberOfAgents);
    
    // Chat is complete if we have at least the configured number of rounds
    if (actualRounds >= configuredRounds && participationMode !== 'round-by-round') {
      setConversationComplete(true);
    } else if (participationMode === 'round-by-round' && actualRounds >= configuredRounds) {
      setConversationComplete(true);
    }
  }, [chat, loading, messages.length]);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Reset generation flag when chatId changes
  useEffect(() => {
    hasStartedGeneration.current = false;
  }, [chatId]);

  // Start generation when chat is loaded and has no messages
  useEffect(() => {
    // Guard against multiple generations and race conditions
    // Wait for credits to load before checking hasCredits()
    if (!chat || !chatId || loading || creditsLoading || messages.length > 0 || isGenerating || hasStartedGeneration.current) return;
    
    // Mark that we've started generation to prevent duplicate calls
    hasStartedGeneration.current = true;

    const startGeneration = async () => {
      if (!isMounted.current) return;
      
      setIsGenerating(true);
      generationStartTime.current = Date.now();
      abortControllerRef.current = new AbortController();
      const settings = chat.settings as any;

      try {
        // Check credits before starting
        if (!hasCredits()) {
          toast.error('No credits remaining. Please purchase more credits to continue.');
          if (isMounted.current) setIsGenerating(false);
          return;
        }

        const apiAvailable = await checkBeforeStarting(state.apiKey);
        if (!apiAvailable || !isMounted.current) {
          if (isMounted.current) setIsGenerating(false);
          return;
        }

        // Look up the full scenario object from the scenario_id
        const scenario = scenarioTypes.find(s => s.id === chat.scenario_id);
        if (!scenario) {
          throw new Error('Scenario not found');
        }

        const onMessageReceived = async (message: any) => {
          if (!chatId || !isMounted.current) return;
          setCurrentAgent(message.agent);
          await saveMessage(chatId, message);
        };

        // Token usage callback - deducts credits based on token usage
        const onTokenUsage: TokenUsageCallback = async (usage, modelId) => {
          const totalTokens = usage.prompt_tokens + usage.completion_tokens;
          await creditsService.useTokensForCredit(user?.id || null, totalTokens, chatId, modelId);
          refreshCredits(); // Update UI
        };

        // Build expert settings from chat settings
        const expertSettings: ExpertSettings | undefined = settings.conversationTone ? {
          conversationTone: settings.conversationTone,
          agreementBias: settings.agreementBias ?? 50,
          personalityIntensity: settings.personalityIntensity ?? 'moderate'
        } : undefined;

        if (isMounted.current) setCurrentAgent('Agent A');
        const { conversationMessages, agentAResponse, agentBResponse } = await handleInitialRound(
          chat.prompt,
          scenario,
          settings.numberOfAgents,
          settings.models.agentA,
          settings.models.agentB,
          settings.models.agentC,
          settings.personas.agentA,
          settings.personas.agentB,
          settings.personas.agentC,
          state.apiKey || '',
          settings.responseLength,
          onMessageReceived,
          settings.temperature, // temperature from settings
          settings.turnOrder || 'sequential',
          onTokenUsage,
          expertSettings
        );

        if (!isMounted.current) return;

        // Check participation mode for round-by-round
        const participationMode = settings.participationMode || 'jump-in';
        
        if (settings.rounds > 1) {
          if (participationMode === 'round-by-round') {
            // In round-by-round mode, pause after first round
            setCurrentAgent(null);
            setCurrentRoundInProgress(2);
            setWaitingForUserInput(true);
            setIsGenerating(false);
          } else {
            // Continue with all rounds automatically
            await handleAdditionalRounds(
              chat.prompt,
              scenario,
              settings.rounds,
              settings.numberOfAgents,
              settings.models.agentA,
              settings.models.agentB,
              settings.models.agentC,
              settings.personas.agentA,
              settings.personas.agentB,
              settings.personas.agentC,
              agentAResponse,
              agentBResponse,
              conversationMessages,
              state.apiKey || '',
              settings.responseLength,
              onMessageReceived,
              settings.temperature, // temperature from settings
              settings.turnOrder || 'sequential',
              onTokenUsage,
              expertSettings
            );
            if (isMounted.current) {
              setCurrentAgent(null);
              setConversationComplete(true);
              // Log completion analytics
              const duration = generationStartTime.current ? Date.now() - generationStartTime.current : 0;
              analyticsService.logChatCompleteByChartId(chatId, settings.numberOfAgents * settings.rounds, duration);
              toast.success('Conversation complete!');
            }
          }
        } else {
          if (isMounted.current) {
            setCurrentAgent(null);
            setConversationComplete(true);
            // Log completion analytics
            const duration = generationStartTime.current ? Date.now() - generationStartTime.current : 0;
            analyticsService.logChatCompleteByChartId(chatId, settings.numberOfAgents, duration);
            toast.success('Conversation complete!');
          }
        }
      } catch (error) {
        if (!isMounted.current) return;
        console.error('Error generating conversation:', error);
        toast.error('Failed to generate conversation');
        setCurrentAgent(null);
      } finally {
        if (isMounted.current) {
          setIsGenerating(false);
        }
      }
    };

    startGeneration();
    // Note: isGenerating intentionally excluded to prevent infinite loop (hasStartedGeneration ref handles this)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat, chatId, loading, creditsLoading, messages.length, state.apiKey, saveMessage, hasCredits, refreshCredits, user?.id, creditsRemaining]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold">Chat not found</p>
          <p className="text-sm text-muted-foreground">
            This chat may have been deleted or you don't have access to it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Chat Title with Participation Mode Badge and Share Button */}
      <div className="border-b px-4 py-3 pr-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <h2 className="font-semibold truncate">{chat.prompt}</h2>
          {(() => {
            const settings = chat.settings as any;
            const mode = settings?.participationMode || 'jump-in';
            const modeConfig = {
              'spectator': { 
                label: 'Spectator', 
                icon: Eye, 
                variant: 'secondary' as const,
                tooltip: 'Watch only mode. Agents will complete all rounds automatically without any input from you.'
              },
              'jump-in': { 
                label: 'Jump In', 
                icon: MessageSquare, 
                variant: 'default' as const,
                tooltip: 'Comment after agents finish. Once all rounds complete, you can add your thoughts and agents will respond.'
              },
              'round-by-round': { 
                label: 'Round by Round', 
                icon: Users, 
                variant: 'outline' as const,
                tooltip: 'Interactive mode. The conversation pauses after each round, letting you contribute or skip to the next round.'
              }
            };
            const config = modeConfig[mode as keyof typeof modeConfig] || modeConfig['jump-in'];
            const Icon = config.icon;
            
            // Conversation tone config
            const tone = settings?.conversationTone || 'collaborative';
            const toneConfig = {
              'formal': { label: 'Formal', icon: GraduationCap, tooltip: 'Academic rigor and professional discourse' },
              'casual': { label: 'Casual', icon: Coffee, tooltip: 'Friendly, everyday conversation' },
              'heated': { label: 'Heated', icon: Flame, tooltip: 'Passionate and assertive viewpoints' },
              'collaborative': { label: 'Collaborative', icon: Handshake, tooltip: 'Building on ideas together' }
            };
            const toneInfo = toneConfig[tone as keyof typeof toneConfig] || toneConfig['collaborative'];
            const ToneIcon = toneInfo.icon;
            
            // Agreement bias
            const bias = settings?.agreementBias ?? 50;
            const biasLabel = bias < 30 ? "Devil's Advocate" : bias > 70 ? "Agreeable" : "Balanced";
            
            return (
              <div className="flex items-center gap-2 flex-wrap">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant={config.variant} className="shrink-0 gap-1.5 cursor-help">
                        <Icon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <p>{config.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {/* Conversation Tone Badge */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="shrink-0 gap-1.5 cursor-help">
                        <ToneIcon className="h-3 w-3" />
                        {toneInfo.label}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <p>{toneInfo.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {/* Agreement Bias Badge - only show if not default */}
                {bias !== 50 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="shrink-0 gap-1.5 cursor-help">
                          <Scale className="h-3 w-3" />
                          {biasLabel}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs">
                        <p>Agreement bias: {bias}% - {bias < 30 ? 'Agents challenge each other' : bias > 70 ? 'Agents build on ideas' : 'Balanced debate'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            );
          })()}
        </div>
        {!isGuest && messages.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareClick}
            className="gap-2 shrink-0"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
        <div className="max-w-4xl mx-auto py-6 space-y-4">
          {messages.map((message, index) => {
            const settings = chat.settings as any;
            const numberOfAgents = settings?.numberOfAgents || 2;
            const currentRound = Math.floor(index / numberOfAgents) + 1;
            const previousRound = index > 0 ? Math.floor((index - 1) / numberOfAgents) + 1 : 0;
            const isNewRound = currentRound > previousRound;

            return (
              <div key={index}>
                {/* Round Separator */}
                {isNewRound && (
                  <RoundSeparator 
                    roundNumber={currentRound} 
                    totalConfiguredRounds={(chat.settings as any)?.rounds || 1}
                    isFinalRound={currentRound === ((chat.settings as any)?.rounds || 1)}
                  />
                )}
                
                {/* Message */}
                <div data-message-index={index}>
                  {message.isHuman ? (
                    <UserMessage 
                      message={message} 
                      messageIndex={index}
                      totalMessages={messages.length}
                      showTimeline={true}
                    />
                  ) : (
                    <ChatMessage 
                      message={message} 
                      messageIndex={index}
                      totalMessages={messages.length}
                      showTimeline={true}
                      isPlaying={isPlaying && currentMessageIndex === index}
                    />
                  )}
                </div>
              </div>
            );
          })}

          {/* Enhanced Typing Indicator */}
          {isGenerating && currentAgent && (
            <AgentTypingIndicator agentName={currentAgent} />
          )}
          
          {/* Round Pause Prompt */}
          {waitingForUserInput && !isGenerating && (
            <RoundPausePrompt 
              roundNumber={currentRoundInProgress - 1}
              onSkip={async () => {
                if (!chat || !chatId) return;
                
                const settings = chat.settings as any;
                const scenario = scenarioTypes.find(s => s.id === chat.scenario_id);
                if (!scenario) return;
                
                setWaitingForUserInput(false);
                setIsGenerating(true);
                
                try {
                  // In round-by-round mode, run only one round at a time
                  const nextRound = currentRoundInProgress;
                  
                  // Token usage callback - deducts credits based on token usage
                  const onTokenUsage: TokenUsageCallback = async (usage, modelId) => {
                    const totalTokens = usage.prompt_tokens + usage.completion_tokens;
                    await creditsService.useTokensForCredit(user?.id || null, totalTokens, chatId, modelId);
                    refreshCredits();
                  };
                  
                  // Build expert settings
                  const expertSettings: ExpertSettings | undefined = settings.conversationTone ? {
                    conversationTone: settings.conversationTone,
                    agreementBias: settings.agreementBias ?? 50,
                    personalityIntensity: settings.personalityIntensity ?? 'moderate'
                  } : undefined;

                  if (nextRound <= settings.rounds) {
                    await handleSingleRound(
                      chat.prompt,
                      scenario,
                      nextRound,
                      settings.rounds,
                      settings.numberOfAgents,
                      settings.models.agentA,
                      settings.models.agentB,
                      settings.models.agentC,
                      settings.personas.agentA,
                      settings.personas.agentB,
                      settings.personas.agentC,
                      messages,
                      state.apiKey || '',
                      settings.responseLength,
                      async (message) => {
                        if (!chatId) return;
                        setCurrentAgent(message.agent);
                        await saveMessage(chatId, message);
                      },
                      settings.temperature, // temperature from settings
                      settings.turnOrder || 'sequential',
                      onTokenUsage,
                      expertSettings
                    );
                    
                    setCurrentAgent(null);
                    
                    // Check if there are more rounds
                    if (nextRound < settings.rounds) {
                      // Pause again for next round
                      setCurrentRoundInProgress(nextRound + 1);
                      setWaitingForUserInput(true);
                    } else {
                      // All rounds complete
                      setCurrentRoundInProgress(settings.rounds + 1);
                      setConversationComplete(true);
                      const duration = generationStartTime.current ? Date.now() - generationStartTime.current : 0;
                      analyticsService.logChatCompleteByChartId(chatId, messages.length + settings.numberOfAgents, duration);
                      toast.success('Conversation complete!');
                    }
                  }
                } catch (error) {
                  console.error('Error continuing rounds:', error);
                  toast.error('Failed to continue conversation');
                  setCurrentAgent(null);
                } finally {
                  setIsGenerating(false);
                }
              }}
            />
          )}
          
          {/* Conversation Complete */}
          {conversationComplete && !isGenerating && !wantsToContinue && (
            <ConversationComplete
              totalRounds={(chat.settings as any)?.rounds || 1}
              participationMode={(chat.settings as any)?.participationMode || 'jump-in'}
              canContinue={true}
              onContinue={() => setWantsToContinue(true)}
              isGuest={isGuest}
            />
          )}
        </div>
      </ScrollArea>

      {/* Input - hide based on participation mode and completion state */}
      {(() => {
        const settings = chat?.settings as any;
        const participationMode = settings?.participationMode || 'jump-in';
        
        // Determine if input should be shown
        let shouldShowInput = false;
        
        if (participationMode === 'spectator') {
          // Never show input for spectator mode
          shouldShowInput = false;
        } else if (participationMode === 'round-by-round') {
          // Show input when waiting for user OR when user explicitly wants to continue after completion
          shouldShowInput = waitingForUserInput || wantsToContinue;
        } else {
          // Jump-in mode: show input after completion OR when not complete yet
          shouldShowInput = conversationComplete || wantsToContinue || !isGenerating;
        }
        
        return shouldShowInput && (
          <ChatInput
            onSend={async (userMessage) => {
              if (!chatId || !chat) return;
              
              // Check credits before user follow-up
              if (!hasCredits()) {
                toast.error('No credits remaining. Please purchase more credits to continue.');
                return;
              }
              
              setWaitingForUserInput(false);
              setIsGenerating(true);
              const settings = chat.settings as any;
              const participationMode = settings.participationMode || 'jump-in';
          
              try {
                // Add user message to conversation
                const userMessageObj: ConversationMessage = {
                  agent: 'You',
                  message: userMessage,
                  model: 'human',
                  persona: 'Human Participant',
                  isHuman: true
                };
                
                await saveMessage(chatId, userMessageObj);
                
                // Get current conversation including the user's new message
                const currentConversation = [...messages, userMessageObj];
                
                // In round-by-round mode, run only ONE round at a time after user input
                if (participationMode === 'round-by-round' && currentRoundInProgress <= settings.rounds) {
                  const scenario = scenarioTypes.find(s => s.id === chat.scenario_id);
                  if (!scenario) throw new Error('Scenario not found');
                  
                  const nextRound = currentRoundInProgress;
                  
                  // Token usage callback - deducts credits based on token usage
                  const onTokenUsage: TokenUsageCallback = async (usage, modelId) => {
                    const totalTokens = usage.prompt_tokens + usage.completion_tokens;
                    await creditsService.useTokensForCredit(user?.id || null, totalTokens, chatId, modelId);
                    refreshCredits();
                  };
                  
                  // Build expert settings
                  const expertSettings: ExpertSettings | undefined = settings.conversationTone ? {
                    conversationTone: settings.conversationTone,
                    agreementBias: settings.agreementBias ?? 50,
                    personalityIntensity: settings.personalityIntensity ?? 'moderate'
                  } : undefined;

                  await handleSingleRound(
                    chat.prompt,
                    scenario,
                    nextRound,
                    settings.rounds,
                    settings.numberOfAgents,
                    settings.models.agentA,
                    settings.models.agentB,
                    settings.models.agentC,
                    settings.personas.agentA,
                    settings.personas.agentB,
                    settings.personas.agentC,
                    currentConversation,
                    state.apiKey || '',
                    settings.responseLength,
                    async (message) => {
                      if (!chatId) return;
                      setCurrentAgent(message.agent);
                      await saveMessage(chatId, message);
                    },
                    settings.temperature,
                    settings.turnOrder || 'sequential',
                    onTokenUsage,
                    expertSettings
                  );
                  
                  setCurrentAgent(null);
                  
                  // Check if there are more rounds
                  if (nextRound < settings.rounds) {
                    // Pause again for next round
                    setCurrentRoundInProgress(nextRound + 1);
                    setWaitingForUserInput(true);
                  } else {
                    // All rounds complete
                    setCurrentRoundInProgress(settings.rounds + 1);
                    setConversationComplete(true);
                    setWantsToContinue(false);
                    toast.success('Conversation complete!');
                  }
                } else {
                  // Token usage callback - deducts credits based on token usage
                  const onTokenUsage: TokenUsageCallback = async (usage, modelId) => {
                    const totalTokens = usage.prompt_tokens + usage.completion_tokens;
                    await creditsService.useTokensForCredit(user?.id || null, totalTokens, chatId, modelId);
                    refreshCredits();
                  };
                  
                  // Jump-in mode or continuing after completion: trigger agents to respond to user's message
                  await handleUserFollowUp(
                    chat.prompt,
                    userMessage,
                    currentConversation,
                    scenarioTypes.find(s => s.id === chat.scenario_id)!,
                    settings.numberOfAgents,
                    settings.models.agentA,
                    settings.models.agentB,
                    settings.models.agentC,
                    settings.personas.agentA,
                    settings.personas.agentB,
                    settings.personas.agentC,
                    state.apiKey || '',
                    settings.responseLength,
                    async (message) => {
                      if (!chatId) return;
                      setCurrentAgent(message.agent);
                      await saveMessage(chatId, message);
                    },
                    undefined,
                    onTokenUsage
                  );
                  
                  setCurrentAgent(null);
                }
              } catch (error) {
                console.error('Error handling user message:', error);
                toast.error('Failed to process your message');
                setCurrentAgent(null);
              } finally {
                setIsGenerating(false);
              }
            }}
            disabled={isGenerating}
            placeholder={
              waitingForUserInput 
                ? "Your turn! Share your thoughts or skip to next round..." 
                : "Continue the conversation..."
            }
          />
        );
      })()}

      {/* Floating Action Bar - Combined Audio + Analysis */}
      {!isGenerating && messages.length > 0 && (
        <FloatingActionBar
          audioEnabled={audioPlaybackEnabled}
          isPlaying={isPlaying}
          isPaused={isPaused}
          isGeneratingAudio={isGeneratingAudio}
          currentMessageIndex={currentMessageIndex}
          totalMessages={messages.length}
          onPlay={play}
          onPause={pause}
          onStop={stop}
          canAnalyze={!isGuest}
          isAnalyzing={isAnalyzing}
          onAnalyze={() => setShowAnalysisDrawer(true)}
        />
      )}

      {/* Analysis Drawer */}
      <AnalysisDrawer
        open={showAnalysisDrawer}
        onOpenChange={setShowAnalysisDrawer}
        isAnalyzing={isAnalyzing}
        analysisResults={analysisResults}
        conversation={messages}
        onAnalyze={() => handleAnalyzeConversation()}
        isGuest={isGuest}
        isSaved={isAnalysisSaved}
      />
    </div>
  );
};
