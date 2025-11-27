import { useParams } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '../components/ChatMessage';
import { UserMessage } from '../components/UserMessage';
import { RoundSeparator } from '../components/RoundSeparator';
import { AgentTypingIndicator } from '../components/AgentTypingIndicator';
import { ChatInput } from '../components/ChatInput';
import { RoundPausePrompt } from '../components/RoundPausePrompt';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';
import { useLabsState } from '../hooks/useLabsState';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { Loader2, Share2, Headphones, Pause, Square } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { handleInitialRound, handleAdditionalRounds, checkBeforeStarting, handleUserFollowUp } from '../hooks/conversation/agent/conversationManager';
import { toast } from 'sonner';
import { ConversationMessage } from '../types';
import { scenarioTypes } from '../constants';
import { AnalysisFloatingButton } from '../components/AnalysisFloatingButton';
import { AnalysisDrawer } from '../components/AnalysisDrawer';
import { useConversationAnalysis } from '../hooks/conversation/useConversationAnalysis';
import { Button } from '@/components/ui/button';
import { useConversationPlayback } from '../hooks/useConversationPlayback';

export const ChatView = () => {
  const { chatId } = useParams();
  const { user } = useAuth();
  const { chat, messages, loading, saveMessage, setMessages, shareChat } = useChat(chatId, user?.id);
  const [state] = useLabsState();
  const { isEnabled } = useFeatureFlags();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<string | null>(null);
  const [showAnalysisDrawer, setShowAnalysisDrawer] = useState(false);
  const [currentRoundInProgress, setCurrentRoundInProgress] = useState(1);
  const [waitingForUserInput, setWaitingForUserInput] = useState(false);
  
  const audioPlaybackEnabled = isEnabled('enable_audio_playback');
  
  const {
    isAnalyzing,
    analysisResults,
    handleAnalyzeConversation
  } = useConversationAnalysis(state.apiKey, messages);

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
      const shareUrl = `${window.location.origin}/labs/agents-meetup/shared/${shareId}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied! Anyone with the link can view this chat.');
    }
  };

  // Start generation when chat is loaded and has no messages
  useEffect(() => {
    if (!chat || !chatId || loading || messages.length > 0 || isGenerating) return;

    const startGeneration = async () => {
      setIsGenerating(true);
      const settings = chat.settings as any;

      try {
        const apiAvailable = await checkBeforeStarting(state.apiKey);
        if (!apiAvailable) {
          setIsGenerating(false);
          return;
        }

        // Look up the full scenario object from the scenario_id
        const scenario = scenarioTypes.find(s => s.id === chat.scenario_id);
        if (!scenario) {
          throw new Error('Scenario not found');
        }

        const onMessageReceived = async (message: any) => {
          if (!chatId) return;
          setCurrentAgent(message.agent);
          await saveMessage(chatId, message);
        };

        setCurrentAgent('Agent A');
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
          onMessageReceived
        );

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
              onMessageReceived
            );
            setCurrentAgent(null);
            toast.success('Conversation complete!');
          }
        } else {
          setCurrentAgent(null);
          toast.success('Conversation complete!');
        }
      } catch (error) {
        console.error('Error generating conversation:', error);
        toast.error('Failed to generate conversation');
        setCurrentAgent(null);
      } finally {
        setIsGenerating(false);
      }
    };

    startGeneration();
  }, [chat, chatId, loading, messages.length, isGenerating, state.apiKey, saveMessage]);

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
      {/* Chat Title with Share Button */}
      <div className="border-b px-4 py-3 pr-16 flex items-center justify-between gap-4">
        <h2 className="font-semibold truncate flex-1">{chat.prompt}</h2>
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
                  <RoundSeparator roundNumber={currentRound} />
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
                  // Get the last agent responses from messages
                  const agentMessages = messages.filter(m => !m.isHuman);
                  const agentAResponse = agentMessages.find(m => m.agent === 'Agent A')?.message || '';
                  const agentBResponse = agentMessages.find(m => m.agent === 'Agent B')?.message || '';
                  
                  // Continue from current round to end
                  const remainingRounds = settings.rounds - currentRoundInProgress + 1;
                  if (remainingRounds > 0) {
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
                      messages,
                      state.apiKey || '',
                      settings.responseLength,
                      async (message) => {
                        if (!chatId) return;
                        setCurrentAgent(message.agent);
                        await saveMessage(chatId, message);
                      }
                    );
                  }
                  
                  setCurrentAgent(null);
                  setCurrentRoundInProgress(settings.rounds + 1);
                  toast.success('Conversation complete!');
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
        </div>
      </ScrollArea>

      {/* Input - hide in spectator mode or when waiting for user in round-by-round */}
      {(() => {
        const settings = chat?.settings as any;
        const participationMode = settings?.participationMode || 'jump-in';
        const shouldShowInput = participationMode !== 'spectator';
        
        return shouldShowInput && (
          <ChatInput
            onSend={async (userMessage) => {
              if (!chatId || !chat) return;
              
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
                
                // In round-by-round mode, continue remaining rounds after user input
                if (participationMode === 'round-by-round' && currentRoundInProgress <= settings.rounds) {
                  const scenario = scenarioTypes.find(s => s.id === chat.scenario_id);
                  if (!scenario) throw new Error('Scenario not found');
                  
                  // Get the last agent responses
                  const agentMessages = currentConversation.filter(m => !m.isHuman);
                  const agentAResponse = agentMessages.find(m => m.agent === 'Agent A')?.message || '';
                  const agentBResponse = agentMessages.find(m => m.agent === 'Agent B')?.message || '';
                  
                  // Continue from current round
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
                    currentConversation,
                    state.apiKey || '',
                    settings.responseLength,
                    async (message) => {
                      if (!chatId) return;
                      setCurrentAgent(message.agent);
                      await saveMessage(chatId, message);
                    }
                  );
                  
                  setCurrentRoundInProgress(settings.rounds + 1);
                  setCurrentAgent(null);
                  toast.success('Conversation complete!');
                } else {
                  // Jump-in mode: trigger agents to respond to user's message
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
                    }
                  );
                  
                  setCurrentAgent(null);
                  toast.success('Agents have responded to your message!');
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

      {/* Floating Playback Button */}
      {audioPlaybackEnabled && !isGenerating && messages.length > 0 && !isPlaying && !isPaused && (
        <Button
          onClick={play}
          className="fixed bottom-20 right-6 rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all"
          size="icon"
        >
          <Headphones className="h-5 w-5" />
        </Button>
      )}

      {/* Playback Controls (when playing or paused) */}
      {audioPlaybackEnabled && (isPlaying || isPaused) && (
        <div className="fixed bottom-20 right-6 bg-background border rounded-full shadow-lg px-4 py-2 flex items-center gap-2">
          {isGeneratingAudio && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          <span className="text-sm font-medium">
            {currentMessageIndex + 1} / {messages.length}
          </span>
          <Button
            onClick={isPlaying ? pause : play}
            size="icon"
            variant="ghost"
            className="h-8 w-8"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Headphones className="h-4 w-4" />}
          </Button>
          <Button
            onClick={stop}
            size="icon"
            variant="ghost"
            className="h-8 w-8"
          >
            <Square className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Floating Analysis Button */}
      {!isGenerating && messages.length > 0 && (
        <AnalysisFloatingButton 
          onClick={() => setShowAnalysisDrawer(true)}
          isAnalyzing={isAnalyzing}
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
      />
    </div>
  );
};
