import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { ScenarioSelector } from '@/components/labs/ScenarioSelector';
import { ConversationSettings } from '@/components/labs/agent-config/ConversationSettings';
import { AgentGridSection } from '@/components/labs/agent-config/AgentGridSection';
import { Badge } from '@/components/ui/badge';
import { scenarioTypes, profiles, responseLengthOptions } from '../constants';
import { useLabsState } from '../hooks/useLabsState';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';
import { toast } from 'sonner';
import type { ConversationMessage } from '../types';
import { handleInitialRound, handleAdditionalRounds, checkBeforeStarting } from '../hooks/conversation/agent/conversationManager';

export const NewChatView = () => {
  const [state, actions] = useLabsState();
  const { user } = useAuth();
  const { saveChat } = useChat(undefined, user?.id);
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);

  // Group models by provider
  const modelsByProvider = state.availableModels.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, any[]>);

  const currentPrompt = state.promptInputs[state.activeScenario] || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPrompt.trim() || isGenerating) return;

    setIsGenerating(true);

    try {
      // Check API availability before starting (optional for shared key mode)
      const isAvailable = await checkBeforeStarting(state.savedApiKey);
      if (!isAvailable) {
        setIsGenerating(false);
        return;
      }

      // Get the current scenario
      const scenario = actions.getCurrentScenario();

      // Execute initial round with all agents based on numberOfAgents setting
      const initialResult = await handleInitialRound(
        currentPrompt,
        scenario,
        state.numberOfAgents,
        state.agentAModel,
        state.agentBModel,
        state.agentCModel,
        state.agentAPersona,
        state.agentBPersona,
        state.agentCPersona,
        state.savedApiKey || '',
        state.responseLength
      );

      let conversationMessages = initialResult.conversationMessages;

      // Execute additional rounds if configured
      if (state.rounds > 1) {
        conversationMessages = await handleAdditionalRounds(
          currentPrompt,
          scenario,
          state.rounds,
          state.numberOfAgents,
          state.agentAModel,
          state.agentBModel,
          state.agentCModel,
          state.agentAPersona,
          state.agentBPersona,
          state.agentCPersona,
          initialResult.agentAResponse,
          initialResult.agentBResponse,
          conversationMessages,
          state.savedApiKey || '',
          state.responseLength
        );
      }

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

        <form onSubmit={handleSubmit} className="space-y-6">
          <ScenarioSelector
            scenarioTypes={scenarioTypes}
            activeScenario={state.activeScenario}
            setActiveScenario={actions.setActiveScenario}
            promptInputs={state.promptInputs}
            handleInputChange={actions.handleInputChange}
          />

          {/* Suggested Topics */}
          <div className="flex flex-wrap gap-2">
            {suggestedTopics.map((topic, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => actions.handleInputChange(state.activeScenario, topic)}
              >
                {topic}
              </Badge>
            ))}
          </div>

          {/* Conversation Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Conversation Settings</h3>
            <ConversationSettings
              numberOfAgents={state.numberOfAgents}
              setNumberOfAgents={actions.setNumberOfAgents}
              rounds={state.rounds}
              setRounds={actions.setRounds}
              responseLength={state.responseLength}
              setResponseLength={actions.setResponseLength}
              responseLengthOptions={responseLengthOptions}
            />
          </div>

          {/* Agent Configuration */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Agent Configuration</h3>
            <AgentGridSection
              numberOfAgents={state.numberOfAgents}
              agentAModel={state.agentAModel}
              setAgentAModel={actions.setAgentAModel}
              agentBModel={state.agentBModel}
              setAgentBModel={actions.setAgentBModel}
              agentCModel={state.agentCModel}
              setAgentCModel={actions.setAgentCModel}
              agentAPersona={state.agentAPersona}
              agentBPersona={state.agentBPersona}
              agentCPersona={state.agentCPersona}
              handleAgentAPersonaChange={actions.handleAgentAPersonaChange}
              handleAgentBPersonaChange={actions.handleAgentBPersonaChange}
              handleAgentCPersonaChange={actions.handleAgentCPersonaChange}
              profiles={profiles}
              formA={state.formA}
              formB={state.formB}
              formC={state.formC}
              modelsByProvider={modelsByProvider}
              loadingModels={state.loadingModels}
            />
          </div>
          
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

        {!user && (
          <div className="text-center text-sm text-muted-foreground">
            💡 Sign in to save your conversations and continue them later
          </div>
        )}
      </div>
    </div>
  );
};
