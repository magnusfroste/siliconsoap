import { DebateMessage } from '../components/DebateMessage';
import { DebateProgress, AnsweringMessage, getLiveRound, useAnsweringClock } from '../components/DebateProgress';
import { DebateCompletion } from '../components/DebateCompletion';
import { JudgeVerdict } from '../components/JudgeVerdict';
import { withRounds, numberClaims } from '../utils/debatePresentation';
import { getAgentSoapName } from '../utils/agentNameGenerator';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Link, useParams } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RoundSeparator } from '../components/RoundSeparator';
import { ChatInput } from '../components/ChatInput';
import { RoundPausePrompt } from '../components/RoundPausePrompt';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';
import { useLabsState } from '../hooks/useLabsState';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { Loader2, Share2, Brain, MoreHorizontal, Pause, Play, Square } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { handleInitialRound, handleAdditionalRounds, handleSingleRound, checkBeforeStarting, handleUserFollowUp, TokenUsageCallback, ExpertSettings, EnhancementOptions } from '@/services/conversationService';
import { webSearchService } from '@/services/webSearchService';
import { useCredits } from '../hooks/useCredits';
import { creditsService } from '@/services';
import { toast } from 'sonner';
import { ConversationMessage, TokenUsage } from '@/models';
import { scenarioTypes } from '../constants';
import { AnalysisDrawer } from '../components/AnalysisDrawer';
import { useConversationAnalysis } from '../hooks/conversation/useConversationAnalysis';
import { Button } from '@/components/ui/button';
import { useConversationPlayback } from '../hooks/useConversationPlayback';
import { analyticsService } from '@/services';
import { useGuestDebateSave } from '../hooks/useGuestDebateSave';
import { usePageMeta } from '@/hooks/usePageMeta';

export const ChatView = () => {
  const { chatId } = useParams();
  const { user } = useAuth();
  const { chat, messages, loading, saveMessage, setMessages, shareChat, unshareChat } = useChat(chatId, user?.id);
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
  const [questionExpanded, setQuestionExpanded] = useState(false);
  
  // Refs to prevent race conditions
  const hasStartedGeneration = useRef(false);
  const isMounted = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const generationStartTime = useRef<number | null>(null);
  
  const audioPlaybackEnabled = isEnabled('enable_audio_playback');
  const judgeBotEnabled = isEnabled('enable_judge_bot');
  const scratchpadEnabled = isEnabled('enable_scratchpad');
  const webSearchEnabled = isEnabled('web_search_enabled');
  const personaTemplateEnabled = isEnabled('use_persona_template');
  const [showInnerThoughts, setShowInnerThoughts] = useState(false);
  
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
    savedAnalyzerModel,
    chat?.scenario_id
  );

  const {
    isPlaying,
    isPaused,
    currentMessageIndex,
    isGenerating: isGeneratingAudio,
    theaterMode,
    audioDuration,
    play,
    playTheater,
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

  // Copy public share link (chats are auto-shared on creation)
  const handleCopyShareClick = async () => {
    if (!chatId) return;
    let shareId = guestShareId || chat?.share_id;
    if (isGuest && !shareId) { if (guestSaveFailed) { toast.error('Saving failed — try again'); return; } toast.info(isSavingGuest || isGenerating ? 'The share link is available when the debate finishes saving.' : 'The share link is not available yet.'); return; }
    if (!shareId) {
      // Re-share previously unshared chat
      shareId = (await shareChat(chatId)) ?? undefined;
    }
    if (shareId) {
      const shareUrl = `${window.location.origin}/shared/${shareId}`;
      try { await navigator.clipboard.writeText(shareUrl); toast.success('Link copied'); }
      catch { toast.error('Could not copy the link'); }
    }
  };

  // Make chat private
  const handleUnshareClick = async () => {
    if (!chatId || isGuest) return;
    const ok = await unshareChat(chatId);
    if (ok) toast.success('Chat is now private. The share link no longer works.');
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

  // Save guest debate once when the conversation completes; failures wait for manual retry
  const guestSave = useGuestDebateSave(
    conversationComplete && isGuest && !!chat && messages.length > 0,
    chatId,
    () => ({
      prompt: chat?.prompt, title: chat?.title, scenarioId: chat?.scenario_id, settings: chat?.settings,
      messages: messages.map(m => ({ agent: m.agent, message: m.message, model: m.model, persona: m.persona })),
      sessionId: chatId,
    }),
  );
  const guestShareId = guestSave.shareId;
  const isSavingGuest = guestSave.status === 'saving';
  const guestSaveFailed = guestSave.status === 'failed';
  const retryGuestSave = guestSave.retry;

  const metaTitle = chat?.title ? (chat.title.length > 60 ? `${chat.title.slice(0, 57).trimEnd()}…` : chat.title) : 'Live debate';
  const metaPrompt = (chat?.prompt || '').replace(/\s+/g, ' ').trim();
  usePageMeta({
    title: `${metaTitle} | SiliconSoap`,
    description: metaPrompt ? `AI models debate: ${metaPrompt.length > 140 ? `${metaPrompt.slice(0, 137).trimEnd()}…` : metaPrompt}` : 'A live multi-agent AI debate on SiliconSoap.',
    canonicalPath: chatId ? `/chat/${chatId}` : '',
  });

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
        const onTokenUsage: TokenUsageCallback = async (usage, modelId, requestedModelId) => {
          const totalTokens = usage.prompt_tokens + usage.completion_tokens;
          console.log('[TokenUsage] chatId:', chatId, 'modelId:', modelId, 'requestedModelId:', requestedModelId, 'tokens:', totalTokens, 'cost:', usage.estimated_cost, 'userId:', user?.id);
          await creditsService.useTokensForCredit(
            user?.id || null, 
            totalTokens, 
            chatId, 
            modelId,
            usage.prompt_tokens,
            usage.completion_tokens,
            usage.estimated_cost,
            requestedModelId
          );
          refreshCredits(); // Update UI
        };

        // Build expert settings from chat settings
        const expertSettings: ExpertSettings | undefined = settings.conversationTone ? {
          conversationTone: settings.conversationTone,
          agreementBias: settings.agreementBias ?? 50,
          personalityIntensity: settings.personalityIntensity ?? 'moderate'
        } : undefined;

        // Pre-fetch web research context (Hermes-style tool use). Fire-and-wait
        // once per debate; the same context is injected into every agent prompt.
        let researchContext: string | undefined;
        if (webSearchEnabled) {
          try {
            const search = await webSearchService.search(chat.prompt, 3);
            if (search.results.length > 0) {
              researchContext = webSearchService.formatAsResearchContext(search.results);
            }
          } catch (e) {
            console.warn('[ChatView] web search failed, continuing without context', e);
          }
        }

        const enhancements: EnhancementOptions = {
          enableScratchpad: scratchpadEnabled,
          usePersonaTemplate: personaTemplateEnabled,
          researchContext
        };

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
          expertSettings,
          enhancements
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
              expertSettings,
              enhancements
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

  const displayLive = chat ? getLiveRound(messages, chat.settings) : null;
  const displayAgent = isGenerating && chat ? (currentAgent && !displayLive?.spoken.has(currentAgent) ? currentAgent : ['Agent A', 'Agent B', 'Agent C'].slice(0, chat.settings.numberOfAgents).find(agent => !displayLive?.spoken.has(agent)) || null) : null;
  const answeringSeconds = useAnsweringClock(displayAgent, isGenerating);
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('debateLiveStatus', { detail: { chatId, live: isGenerating } }));
    return () => { window.dispatchEvent(new CustomEvent('debateLiveStatus', { detail: { chatId, live: false } })); };
  }, [chatId, isGenerating]);

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

  const settings = chat.settings;
  const rounded = withRounds(messages);
  const flagged = new Set(numberClaims(rounded).map(claim => claim.sentence));
  const mode = settings.participationMode || 'jump-in';
  const answers = rounded.filter(entry => !entry.isUser).length;
  const actualRounds = rounded[rounded.length - 1]?.round || settings.rounds;
  const live = getLiveRound(messages, settings);
  const candidate = ['Agent A', 'Agent B', 'Agent C'].slice(0, settings.numberOfAgents).find(agent => !live.spoken.has(agent));
  const answeringAgent = isGenerating ? (currentAgent && !live.spoken.has(currentAgent) ? currentAgent : candidate || null) : null;
  const shareId = guestShareId || chat.share_id;
  const shareUrl = shareId ? `https://siliconsoap.com/shared/${shareId}` : undefined;
  const shouldShowInput = mode === 'spectator' ? false : mode === 'round-by-round' ? waitingForUserInput || wantsToContinue : conversationComplete || wantsToContinue || !isGenerating;
  const bias = settings.agreementBias ?? 50;
  const chips = [mode === 'spectator' ? 'Spectator' : mode === 'round-by-round' ? 'Round by round' : 'Jump in', `${settings.conversationTone || 'collaborative'} tone`, ...(bias !== 50 ? [`${bias < 30 ? "Devil's advocate" : bias > 70 ? 'Agreeable' : 'Balanced'} · bias ${bias}`] : []), `${settings.rounds} round${settings.rounds === 1 ? '' : 's'}`];
  const onSkip = async () => {
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
                  const onTokenUsage: TokenUsageCallback = async (usage, modelId, requestedModelId) => {
                    const totalTokens = usage.prompt_tokens + usage.completion_tokens;
                    await creditsService.useTokensForCredit(
                      user?.id || null, 
                      totalTokens, 
                      chatId, 
                      modelId,
                      usage.prompt_tokens,
                      usage.completion_tokens,
                      usage.estimated_cost,
                      requestedModelId
                    );
                    refreshCredits();
                  };
                  
                  // Build expert settings
                  const expertSettings: ExpertSettings | undefined = settings.conversationTone ? {
                    conversationTone: settings.conversationTone,
                    agreementBias: settings.agreementBias ?? 50,
                    personalityIntensity: settings.personalityIntensity ?? 'moderate'
                  } : undefined;

                  const enhancements: EnhancementOptions = {
                    enableScratchpad: scratchpadEnabled,
                    usePersonaTemplate: personaTemplateEnabled
                  };

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
                      expertSettings,
                      enhancements
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
              };
  const onSend = async (userMessage) => {
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
                  const onTokenUsage: TokenUsageCallback = async (usage, modelId, requestedModelId) => {
                    const totalTokens = usage.prompt_tokens + usage.completion_tokens;
                    await creditsService.useTokensForCredit(
                      user?.id || null, 
                      totalTokens, 
                      chatId, 
                      modelId,
                      usage.prompt_tokens,
                      usage.completion_tokens,
                      usage.estimated_cost,
                      requestedModelId
                    );
                    refreshCredits();
                  };
                  
                  // Build expert settings
                  const expertSettings: ExpertSettings | undefined = settings.conversationTone ? {
                    conversationTone: settings.conversationTone,
                    agreementBias: settings.agreementBias ?? 50,
                    personalityIntensity: settings.personalityIntensity ?? 'moderate'
                  } : undefined;

                  const enhancements: EnhancementOptions = {
                    enableScratchpad: scratchpadEnabled,
                    usePersonaTemplate: personaTemplateEnabled
                  };

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
                    expertSettings,
                    enhancements
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
                  const onTokenUsage: TokenUsageCallback = async (usage, modelId, requestedModelId) => {
                    const totalTokens = usage.prompt_tokens + usage.completion_tokens;
                    await creditsService.useTokensForCredit(
                      user?.id || null, 
                      totalTokens, 
                      chatId, 
                      modelId,
                      usage.prompt_tokens,
                      usage.completion_tokens,
                      usage.estimated_cost,
                      requestedModelId
                    );
                    refreshCredits();
                  };
                  
                  const followUpScenario = scenarioTypes.find(s => s.id === chat.scenario_id);
                  if (!followUpScenario) throw new Error('Scenario not found');
                  // Jump-in mode or continuing after completion: trigger agents to respond to user's message
                  await handleUserFollowUp(
                    chat.prompt,
                    userMessage,
                    currentConversation,
                    followUpScenario,
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
                    onTokenUsage,
                    {
                      enableScratchpad: scratchpadEnabled,
                      usePersonaTemplate: personaTemplateEnabled
                    }
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
            };
  const input = <ChatInput onSend={onSend} disabled={isGenerating} placeholder="Add your view and the agents will respond to you…" />;
  const reasoningButton = scratchpadEnabled && <Button variant={showInnerThoughts ? 'secondary' : 'outline'} className="min-h-11 gap-2" aria-pressed={showInnerThoughts} onClick={() => setShowInnerThoughts(value => !value)}><Brain className="h-4 w-4" />Private reasoning</Button>;

  return <div className="flex h-full min-h-0 min-w-0 flex-col bg-background">
    <header className="shrink-0 border-b px-4 py-4 md:px-8 md:py-5">
      <div className="mx-auto flex max-w-5xl items-start justify-between gap-4">
        <div className="min-w-0 flex-1"><h1 className={`font-display text-xl font-semibold leading-tight md:text-3xl ${questionExpanded ? '' : 'line-clamp-2'}`}>{chat.prompt}</h1><Button variant="link" className="mt-1 h-auto p-0 text-xs" onClick={() => setQuestionExpanded(value => !value)}><span className="md:hidden">{questionExpanded ? 'Less' : 'More'}</span><span className="hidden md:inline">{questionExpanded ? 'Show less' : 'Show full question'}</span></Button>
          <div className="mt-3 flex flex-wrap gap-1.5">{chips.map((chip, index) => <span key={chip} className={`rounded-full border bg-card px-2.5 py-1 text-[11px] capitalize ${index > 2 ? 'hidden md:inline-flex' : ''}`}>{chip}</span>)}{conversationComplete && !isGenerating && <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] text-accent-foreground">Complete · {answers} answers</span>}</div>
        </div>
        <div className="hidden shrink-0 items-center gap-2 md:flex">{reasoningButton}<Button variant="outline" className="min-h-11" onClick={handleCopyShareClick}><Share2 className="mr-2 h-4 w-4" />Share</Button>
          <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="icon" className="h-11 w-11" aria-label="More debate actions"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">{!isGuest && chat.share_id && <DropdownMenuItem onClick={handleUnshareClick}>Unshare</DropdownMenuItem>}{audioPlaybackEnabled && <><DropdownMenuItem onClick={play} disabled={!messages.length}>Listen to the debate</DropdownMenuItem><DropdownMenuItem onClick={playTheater} disabled={!messages.length}>Theater mode</DropdownMenuItem></>}</DropdownMenuContent></DropdownMenu>
        </div>
      </div>
    </header>
    {isGenerating && <DebateProgress settings={settings} messages={messages} answeringAgent={answeringAgent} seconds={answeringSeconds} models={state.availableModels} />}
    <ScrollArea className="min-h-0 flex-1" ref={scrollAreaRef}>
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-5 md:px-8 md:py-8">
        {rounded.map((entry, position) => {
          const index = messages.indexOf(entry.message);
          if (theaterMode && (isPlaying || isPaused) && index > currentMessageIndex) return null;
          const theaterReveal = theaterMode && isPlaying && index === currentMessageIndex;
          return <div key={entry.message.id || index}>
            {(position === 0 || rounded[position - 1].round !== entry.round) && <RoundSeparator roundNumber={entry.round} totalConfiguredRounds={settings.rounds} isFinalRound={entry.round === settings.rounds} />}
            <div data-message-index={index}><DebateMessage entry={entry} index={index} total={messages.length} chatUrl={shareUrl} flagged={flagged} reasoningEnabled={scratchpadEnabled} reasoningOpen={showInnerThoughts} userLabel="You" isPlaying={isPlaying && currentMessageIndex === index} isTheaterReveal={theaterReveal} audioDurationMs={theaterReveal ? audioDuration : null} /></div>
          </div>;
        })}
        {isGenerating && answeringAgent && <>{(!rounded.length || live.round > (rounded[rounded.length - 1]?.round || 0)) && <RoundSeparator roundNumber={live.round} totalConfiguredRounds={settings.rounds} isFinalRound={live.round === settings.rounds} />}<AnsweringMessage agent={answeringAgent} settings={settings} seconds={answeringSeconds} /></>}
        {isGenerating && <p className="rounded-md border bg-card px-4 py-3 text-xs text-muted-foreground">{live.round >= settings.rounds ? 'Final round' : <>Up next: Round {live.round + 1} · {(['A', 'B', 'C'] as const).slice(0, settings.numberOfAgents).map(letter => getAgentSoapName(`Agent ${letter}`, settings.personas[`agent${letter}`])).join(', ')} respond to each other</>}</p>}
        {waitingForUserInput && !isGenerating && <RoundPausePrompt roundNumber={currentRoundInProgress - 1} onSkip={onSkip}><div className="hidden md:block">{input}</div></RoundPausePrompt>}
        {conversationComplete && !isGenerating && <DebateCompletion answers={answers} rounds={actualRounds} shareId={shareId} saving={isSavingGuest} saveFailed={guestSaveFailed} onRetrySave={retryGuestSave} title={chat.title} prompt={chat.prompt} onCopy={handleCopyShareClick} judgeEnabled={judgeBotEnabled} isGuest={isGuest} onJudge={() => setShowAnalysisDrawer(true)} audioEnabled={audioPlaybackEnabled} onPlay={play} onTheater={playTheater} />}
        {judgeBotEnabled && analysisResults && <JudgeVerdict analysis={analysisResults} />}
        {shouldShowInput && !waitingForUserInput && <section className="hidden rounded-lg border bg-card p-4 md:block"><h2 className="text-sm font-semibold">Jump in</h2>{input}</section>}
        {mode !== 'spectator' && conversationComplete && !wantsToContinue && <Button variant="ghost" className="hidden md:inline-flex" onClick={() => setWantsToContinue(true)}>Continue the debate</Button>}
      </div>
    </ScrollArea>
    {audioPlaybackEnabled && (isPlaying || isPaused || isGeneratingAudio) && <div className="flex shrink-0 items-center justify-center gap-3 border-t bg-card px-3 py-2" aria-label="Audio player"><Button variant="outline" size="icon" className="h-11 w-11" aria-label={isPaused ? 'Resume playback' : 'Pause playback'} onClick={isPaused ? play : pause}>{isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}</Button><Button variant="outline" size="icon" className="h-11 w-11" aria-label="Stop playback" onClick={stop}><Square className="h-4 w-4" /></Button><span className="text-xs">{isGeneratingAudio ? 'Preparing audio · ' : ''}Message {currentMessageIndex + 1} of {messages.length}</span></div>}
    <div className="shrink-0 border-t bg-card p-3 md:hidden">{shouldShowInput ? <><h2 className="text-xs font-semibold">{waitingForUserInput ? `Round ${currentRoundInProgress - 1} done — your turn` : 'Jump in'}</h2>{input}</> : <div className="flex gap-2">{isGenerating ? reasoningButton : null}<Button variant="default" className="min-h-11 flex-1" onClick={guestSaveFailed ? retryGuestSave : handleCopyShareClick} disabled={isSavingGuest}>{guestSaveFailed ? 'Try again' : conversationComplete && !isGenerating ? 'Copy share link' : 'Share'}</Button>{conversationComplete && !isGenerating && <Button asChild variant="outline" className="min-h-11"><Link to={`/new?prompt=${encodeURIComponent(chat.prompt)}`}>Rerun</Link></Button>}</div>}</div>
    {judgeBotEnabled && <AnalysisDrawer open={showAnalysisDrawer} onOpenChange={setShowAnalysisDrawer} isAnalyzing={isAnalyzing} analysisResults={analysisResults} conversation={messages} onAnalyze={() => handleAnalyzeConversation()} isGuest={isGuest} isSaved={isAnalysisSaved} />}
  </div>;
};
