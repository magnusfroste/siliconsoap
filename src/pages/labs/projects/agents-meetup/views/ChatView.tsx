import { useParams } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '../components/ChatMessage';
import { ChatInput } from '../components/ChatInput';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';
import { useLabsState } from '../hooks/useLabsState';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { handleInitialRound, handleAdditionalRounds, checkBeforeStarting } from '../hooks/conversation/agent/conversationManager';
import { toast } from 'sonner';
import { scenarioTypes } from '../constants';

export const ChatView = () => {
  const { chatId } = useParams();
  const { user } = useAuth();
  const { chat, messages, loading, saveMessage, setMessages } = useChat(chatId, user?.id);
  const [state] = useLabsState();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<string | null>(null);

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

        if (settings.rounds > 1) {
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
        }

        setCurrentAgent(null);
        toast.success('Conversation complete!');
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
      {/* Chat Title */}
      <div className="border-b px-4 py-3">
        <h2 className="font-semibold truncate">{chat.prompt}</h2>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4">
        <div className="max-w-4xl mx-auto py-6 space-y-4">
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}

          {isGenerating && currentAgent && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">{currentAgent} is thinking...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <ChatInput 
        onSend={(message) => {
          // TODO: Implement follow-up conversation logic
          console.log('Follow-up:', message);
        }}
        disabled={isGenerating}
        placeholder="Continue the conversation..."
      />
    </div>
  );
};
