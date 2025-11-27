import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { ScenarioSelector } from '@/components/labs/ScenarioSelector';
import { ConversationSettings } from '@/components/labs/agent-config/ConversationSettings';
import { AgentGridSection } from '@/components/labs/agent-config/AgentGridSection';
import { ExpertSettings } from '@/components/labs/agent-config/ExpertSettings';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
            turnOrder: state.turnOrder,
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
        navigate(`/chat/${guestChatId}`);
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
              turnOrder: state.turnOrder,
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
        navigate(`/chat/${chatData.id}`);
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
      "How to regulate AI development?",
      "Universal Basic Income viability?",
      "Tariffs between countries?"
    ],
    'ethical-dilemma': [
      "Should AI have legal rights?",
      "Is gene editing babies ethical?",
      "Privacy vs security trade-offs?"
    ],
    'future-prediction': [
      "AGI by 2030",
      "Brain-computer interfaces",
      "Future of work automation"
    ]
  };

  const suggestedTopics = suggestedTopicsByScenario[state.activeScenario] || suggestedTopicsByScenario['general-problem'];

  return (
    <div className="min-h-full flex flex-col items-center justify-start p-4 py-8 md:py-12">
      <div className="w-full max-w-4xl space-y-6 md:space-y-8">
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

          {/* Configuration Card */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              {/* Conversation Settings */}
              <ConversationSettings
                numberOfAgents={state.numberOfAgents}
                setNumberOfAgents={actions.setNumberOfAgents}
                rounds={state.rounds}
                setRounds={actions.setRounds}
                responseLength={state.responseLength}
                setResponseLength={actions.setResponseLength}
                participationMode={state.participationMode}
                setParticipationMode={actions.setParticipationMode}
                turnOrder={state.turnOrder}
                setTurnOrder={actions.setTurnOrder}
                responseLengthOptions={responseLengthOptions}
              />
              
              <Separator className="my-4" />
              
              {/* Expert Settings */}
              <ExpertSettings
                conversationTone={state.conversationTone}
                setConversationTone={actions.setConversationTone}
                agreementBias={state.agreementBias}
                setAgreementBias={actions.setAgreementBias}
                temperature={state.temperature}
                setTemperature={actions.setTemperature}
                personalityIntensity={state.personalityIntensity}
                setPersonalityIntensity={actions.setPersonalityIntensity}
              />

              <Separator className="my-4" />

              {/* Agent Configuration */}
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
                conversationTone={state.conversationTone}
                agreementBias={state.agreementBias}
                temperature={state.temperature}
                personalityIntensity={state.personalityIntensity}
              />
            </CardContent>
          </Card>
          
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
