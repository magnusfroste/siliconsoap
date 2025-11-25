import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles } from 'lucide-react';
import { useLabsState } from '../hooks/useLabsState';
import { useAgentConversation } from '../hooks/conversation/useAgentConversation';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';
import { toast } from 'sonner';

export const NewChatView = () => {
  const [topic, setTopic] = useState('');
  const [state, actions] = useLabsState();
  const { user } = useAuth();
  const { saveChat } = useChat(undefined, user?.id);
  const navigate = useNavigate();

  const { handleStartConversation, isLoading } = useAgentConversation(
    state.savedApiKey,
    state.agentAModel,
    state.agentBModel,
    state.agentCModel,
    state.agentAPersona,
    state.agentBPersona,
    state.agentCPersona,
    state.numberOfAgents,
    state.rounds,
    state.responseLength,
    actions.getCurrentScenario,
    actions.getCurrentPrompt
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isLoading) return;

    // Set the prompt in state
    actions.setPromptInputs({ ...state.promptInputs, 'brainstorm': topic });

    // Start the conversation
    await handleStartConversation();

    // If logged in and conversation is successful, save the chat
    if (user && state.conversation.length > 0) {
      const title = topic.slice(0, 50) + (topic.length > 50 ? '...' : '');
      const chatId = await saveChat(
        title,
        state.activeScenario || 'brainstorm',
        topic,
        {
          agentAModel: state.agentAModel,
          agentBModel: state.agentBModel,
          agentCModel: state.agentCModel,
          agentAPersona: state.agentAPersona,
          agentBPersona: state.agentBPersona,
          agentCPersona: state.agentCPersona,
          numberOfAgents: state.numberOfAgents,
          rounds: state.rounds,
          responseLength: state.responseLength
        },
        state.conversation
      );

      if (chatId) {
        navigate(`/labs/agents-meetup/chat/${chatId}`);
      }
    }
  };

  const suggestedTopics = [
    "Future of AI in healthcare",
    "Climate change solutions",
    "The ethics of gene editing",
    "Future of work and automation"
  ];

  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">What would you like to discuss?</h1>
          <p className="text-muted-foreground">
            Let AI agents collaborate and explore your topic from multiple perspectives
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic for the agents to discuss..."
              className="min-h-[120px] text-base resize-none pr-12"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-2 bottom-2"
              disabled={!topic.trim() || isLoading}
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>
        </form>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Or try one of these:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedTopics.map((suggested, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setTopic(suggested)}
                disabled={isLoading}
              >
                {suggested}
              </Button>
            ))}
          </div>
        </div>

        {!user && (
          <div className="text-center text-sm text-muted-foreground">
            💡 Sign in to save your conversations and continue them later
          </div>
        )}
      </div>
    </div>
  );
};
