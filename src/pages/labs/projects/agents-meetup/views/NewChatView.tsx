import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { ScenarioSelector } from '@/components/labs/ScenarioSelector';
import { scenarioTypes } from '../constants';
import { useLabsState } from '../hooks/useLabsState';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ConversationMessage } from '../types';

export const NewChatView = () => {
  const [state, actions] = useLabsState();
  const { user } = useAuth();
  const { saveChat } = useChat(undefined, user?.id);
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);

  const currentPrompt = state.promptInputs[state.activeScenario] || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPrompt.trim() || isGenerating) return;

    setIsGenerating(true);

    try {
      // Get the current scenario and format the prompt
      const scenario = actions.getCurrentScenario();
      const formattedPrompt = scenario.promptTemplate(currentPrompt);

      // Call edge function to generate conversation using Lovable AI
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'user',
              content: formattedPrompt
            }
          ]
        }
      });

      if (error) throw error;
      if (!data?.choices?.[0]?.message?.content) {
        throw new Error('No response from AI');
      }

      // Create conversation messages
      const conversationMessages: ConversationMessage[] = [
        {
          agent: 'A',
          message: data.choices[0].message.content,
          model: state.agentAModel,
          persona: state.agentAPersona
        }
      ];

      // Save chat immediately and get the ID
      const title = currentPrompt.slice(0, 50) + (currentPrompt.length > 50 ? '...' : '');
      const chatId = await saveChat(
        title,
        state.activeScenario,
        currentPrompt,
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
        conversationMessages
      );

      // Navigate immediately with the returned chatId
      if (chatId) {
        navigate(`/labs/agents-meetup/chat/${chatId}`);
      } else {
        throw new Error('Failed to save chat');
      }

    } catch (error: any) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation', {
        description: error.message || 'Please try again'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const suggestedTopicsByScenario: Record<string, string[]> = {
    'general-problem': [
      "How can we reduce traffic congestion?",
      "Solutions for affordable housing crisis",
      "Improving public education systems",
      "Sustainable food production methods"
    ],
    'text-analysis': [
      "Analyze Shakespeare's writing style",
      "Compare two news articles on same topic",
      "Identify author of anonymous text",
      "Examine rhetoric in political speeches"
    ],
    'ethical-dilemma': [
      "Should AI have legal rights?",
      "Ethics of human genetic enhancement",
      "Moral obligations to future generations",
      "Privacy vs security in surveillance"
    ],
    'future-prediction': [
      "Future of remote work in 2030",
      "Impact of quantum computing",
      "Evolution of social media platforms",
      "Climate adaptation technologies"
    ]
  };

  const suggestedTopics = suggestedTopicsByScenario[state.activeScenario] || suggestedTopicsByScenario['general-problem'];

  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">What would you like to discuss?</h1>
          <p className="text-muted-foreground">
            Let AI agents collaborate and explore your topic from multiple perspectives
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ScenarioSelector
            scenarioTypes={scenarioTypes}
            activeScenario={state.activeScenario}
            setActiveScenario={actions.setActiveScenario}
            promptInputs={state.promptInputs}
            handleInputChange={actions.handleInputChange}
          />
          
          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              className="gap-2"
              disabled={!currentPrompt.trim() || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Start Conversation
                </>
              )}
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
                onClick={() => actions.handleInputChange(state.activeScenario, suggested)}
                disabled={isGenerating}
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
