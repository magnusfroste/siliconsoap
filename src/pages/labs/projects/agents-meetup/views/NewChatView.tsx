import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { ScenarioSelector } from '@/components/labs/ScenarioSelector';
import { ConversationSettings } from '@/components/labs/agent-config/ConversationSettings';
import { AgentGridSection } from '@/components/labs/agent-config/AgentGridSection';
import { Badge } from '@/components/ui/badge';
import { scenarioTypes, responseLengthOptions } from '../constants';
import { useLabsState } from '../hooks/useLabsState';
import { useAgentProfiles } from '@/hooks/useAgentProfiles';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';
import { useCredits } from '../hooks/useCredits';
import { toast } from 'sonner';
import type { ConversationMessage } from '../types';
import { handleInitialRound, handleAdditionalRounds, checkBeforeStarting } from '../hooks/conversation/agent/conversationManager';
import { CreditsExhaustedModal } from '../components/CreditsExhaustedModal';

export const NewChatView = () => {
  const { profiles } = useAgentProfiles();
  const [state, actions] = useLabsState();
  const { user } = useAuth();
  const { saveChat } = useChat(undefined, user?.id);
  const { creditsRemaining, hasCredits, useCredit, isGuest } = useCredits(user?.id);
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);

  // Group models by provider
  const modelsByProvider = state.availableModels.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, any[]>);

  const currentPrompt = state.promptInputs[state.activeScenario] || '';

  const handleApiKeySubmit = (apiKey: string) => {
    // Store API key in localStorage for BYOK
    localStorage.setItem('userOpenRouterApiKey', apiKey);
    toast.success('API key saved! You can now continue with unlimited usage.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPrompt.trim() || isGenerating) return;

    // Check credits before proceeding
    if (!hasCredits()) {
      // Check if user has BYOK API key
      const userApiKey = localStorage.getItem('userOpenRouterApiKey');
      if (!userApiKey) {
        setShowCreditsModal(true);
        return;
      }
      // If user has API key, proceed without credit check
    }

    // For guests without credits, don't allow starting chat
    if (isGuest && !hasCredits()) {
      setShowCreditsModal(true);
      return;
    }

    // For logged-in users, require user ID
    if (!isGuest && !user?.id) {
      toast.error('Please sign in to continue');
      return;
    }

    setIsGenerating(true);

    try {
      // Use a credit before starting
      const creditUsed = await useCredit();
      if (!creditUsed && !localStorage.getItem('userOpenRouterApiKey')) {
        setShowCreditsModal(true);
        setIsGenerating(false);
        return;
      }

      if (isGuest) {
        // Guests: Store chat in localStorage temporarily
        const guestChatId = `guest_${Date.now()}`;
        const guestChats = JSON.parse(localStorage.getItem('guest_chats') || '{}');
        guestChats[guestChatId] = {
          id: guestChatId,
          title: currentPrompt.substring(0, 50) + (currentPrompt.length > 50 ? '...' : ''),
          scenario_id: state.activeScenario,
          prompt: currentPrompt,
          settings: {
            numberOfAgents: state.numberOfAgents,
            rounds: state.rounds,
            responseLength: state.responseLength,
            participationMode: state.participationMode,
            models: {
              agentA: state.agentAModel,
              agentB: state.agentBModel,
              agentC: state.agentCModel
            },
            personas: {
              agentA: state.agentAPersona,
              agentB: state.agentBPersona,
              agentC: state.agentCPersona
            }
          },
          messages: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        localStorage.setItem('guest_chats', JSON.stringify(guestChats));
        
        // Navigate to guest chat
        navigate(`/labs/agents-meetup/chat/${guestChatId}`);
      } else {
        // Logged-in users: Create in database
        const { supabase } = await import('@/integrations/supabase/client');
        
        const { data: chatData, error: chatError } = await supabase
          .from('agent_chats')
          .insert({
            user_id: user!.id,
            title: currentPrompt.substring(0, 50) + (currentPrompt.length > 50 ? '...' : ''),
            scenario_id: state.activeScenario,
            prompt: currentPrompt,
            settings: {
              numberOfAgents: state.numberOfAgents,
              rounds: state.rounds,
              responseLength: state.responseLength,
              participationMode: state.participationMode,
              models: {
                agentA: state.agentAModel,
                agentB: state.agentBModel,
                agentC: state.agentCModel
              },
              personas: {
                agentA: state.agentAPersona,
                agentB: state.agentBPersona,
                agentC: state.agentCPersona
              }
            }
          })
          .select()
          .single();

        if (chatError || !chatData) {
          throw chatError || new Error('Failed to create chat');
        }

        // Navigate to chat view
        navigate(`/labs/agents-meetup/chat/${chatData.id}`);
      }
    } catch (error: any) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create conversation', {
        description: error.message || 'Please try again'
      });
      setIsGenerating(false);
    }
  };

  const suggestedTopicsByScenario: Record<string, string[]> = {
    'general-problem': [
      "Reducing traffic congestion in cities",
      "Affordable housing solutions",
      "Sustainable food production"
    ],
    'ethical-dilemma': [
      "Should AI have legal rights?",
      "Ethics of human genetic enhancement",
      "Privacy vs security in surveillance"
    ],
    'future-prediction': [
      "Future of remote work by 2030",
      "Impact of quantum computing",
      "Climate adaptation technologies"
    ]
  };

  const suggestedTopics = suggestedTopicsByScenario[state.activeScenario] || suggestedTopicsByScenario['general-problem'];

  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">What would you like to discuss?</h1>
          <p className="text-muted-foreground">
            Let AI agents collaborate and explore your topic from multiple perspectives
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <ScenarioSelector
            scenarioTypes={scenarioTypes}
            activeScenario={state.activeScenario}
            setActiveScenario={actions.setActiveScenario}
            promptInputs={state.promptInputs}
            handleInputChange={actions.handleInputChange}
            suggestedTopics={suggestedTopics}
          />

          {/* Conversation Settings */}
          <div className="space-y-4">
            <ConversationSettings
              numberOfAgents={state.numberOfAgents}
              setNumberOfAgents={actions.setNumberOfAgents}
              rounds={state.rounds}
              setRounds={actions.setRounds}
              responseLength={state.responseLength}
              setResponseLength={actions.setResponseLength}
              participationMode={state.participationMode}
              setParticipationMode={actions.setParticipationMode}
              responseLengthOptions={responseLengthOptions}
            />
          </div>

          {/* Agent Configuration */}
          <div className="space-y-4">
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
          
          <div className="flex justify-center">
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
            💡 Sign in to save your conversations and analyze results
          </div>
        )}

        <CreditsExhaustedModal
          open={showCreditsModal}
          onOpenChange={setShowCreditsModal}
          isGuest={isGuest}
          onApiKeySubmit={handleApiKeySubmit}
        />
      </div>
    </div>
  );
};
