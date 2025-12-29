import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { ScenarioSelector } from '@/components/labs/ScenarioSelector';
import { ConversationSettings } from '@/components/labs/agent-config/ConversationSettings';
import { AgentGridSection } from '@/components/labs/agent-config/AgentGridSection';
import { ExpertSettings } from '@/components/labs/agent-config/ExpertSettings';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { scenarioTypes, responseLengthOptions } from '../constants';
import { useLabsState } from '../hooks/useLabsState';
import { useAgentProfiles } from '@/hooks/useAgentProfiles';
import { useAuth } from '../hooks/useAuth';
import { useCredits } from '../hooks/useCredits';
import { toast } from 'sonner';
import { chatService } from '@/services';
import { creditsService } from '@/services';
import { analyticsService } from '@/services';
import { CreditsExhaustedModal } from '../components/CreditsExhaustedModal';
import { suggestedTopicsByScenario, getRandomTopics } from '../constants/suggestedTopics';
import { usePageMeta } from '@/hooks/usePageMeta';
import type { ChatSettings } from '@/models/chat';

export const NewChatView = () => {
  const isMounted = useRef(true);

  usePageMeta({
    title: 'Start an AI Debate',
    description: 'Create a new AI debate and watch multiple AI agents discuss your topic from different perspectives. Choose from various models and personas.',
    canonicalPath: '/new',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'New Debate', path: '/new' },
    ],
  });
  
  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  const { profiles } = useAgentProfiles();
  const [state, actions] = useLabsState();
  const { user } = useAuth();
  const { creditsRemaining, hasCredits, useCredit, isGuest, loading: creditsLoading } = useCredits(user?.id);
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);

  // Group models by provider for CuratedModel type
  const modelsByProvider = state.availableModels.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, typeof state.availableModels>);

  const currentPrompt = state.promptInputs[state.activeScenario] || '';


  // Build chat settings from current state
  const buildChatSettings = (): ChatSettings => ({
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
    },
    conversationTone: state.conversationTone,
    agreementBias: state.agreementBias,
    temperature: state.temperature,
    personalityIntensity: state.personalityIntensity
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPrompt.trim() || isGenerating) return;

    // Wait for credits to load before checking
    if (creditsLoading) {
      toast.info('Loading credits...');
      return;
    }

    // Check credits before proceeding
    if (!creditsService.canStartConversation(creditsRemaining)) {
      setShowCreditsModal(true);
      return;
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
      if (!creditUsed) {
        if (isMounted.current) {
          setShowCreditsModal(true);
          setIsGenerating(false);
        }
        return;
      }

      const settings = buildChatSettings();
      const title = chatService.generateTitle(currentPrompt);

      // Collect models used for analytics
      const modelsUsed: string[] = [settings.models.agentA];
      if (settings.numberOfAgents >= 2) modelsUsed.push(settings.models.agentB);
      if (settings.numberOfAgents >= 3) modelsUsed.push(settings.models.agentC);

      if (isGuest) {
        // Guests: Create chat in localStorage
        const guestChat = chatService.createGuestChat(
          currentPrompt,
          state.activeScenario,
          settings
        );
        
        // Log analytics for guest chat
        analyticsService.logChatStart({
          chatId: guestChat.id,
          isGuest: true,
          promptPreview: currentPrompt,
          scenarioId: state.activeScenario,
          modelsUsed,
          numAgents: settings.numberOfAgents,
          numRounds: settings.rounds
        });
        
        if (isMounted.current) {
          navigate(`/chat/${guestChat.id}`);
        }
      } else {
        // Logged-in users: Create in database
        const chat = await chatService.createChat({
          user_id: user!.id,
          title,
          scenario_id: state.activeScenario,
          prompt: currentPrompt,
          settings
        });
        
        // Log analytics for logged-in user
        analyticsService.logChatStart({
          chatId: chat.id,
          userId: user!.id,
          isGuest: false,
          promptPreview: currentPrompt,
          scenarioId: state.activeScenario,
          modelsUsed,
          numAgents: settings.numberOfAgents,
          numRounds: settings.rounds
        });
        
        if (isMounted.current) {
          navigate(`/chat/${chat.id}`);
        }
      }
    } catch (error: any) {
      console.error('Error creating chat:', error);
      if (isMounted.current) {
        toast.error('Failed to create conversation', {
          description: error.message || 'Please try again'
        });
        setIsGenerating(false);
      }
    }
  };

  // Randomize topics on component mount - new set each page visit
  const [randomizedTopics, setRandomizedTopics] = useState<Record<string, string[]>>({});
  
  useEffect(() => {
    setRandomizedTopics({
      'general-problem': getRandomTopics(suggestedTopicsByScenario['general-problem'], 3),
      'ethical-dilemma': getRandomTopics(suggestedTopicsByScenario['ethical-dilemma'], 3),
      'future-prediction': getRandomTopics(suggestedTopicsByScenario['future-prediction'], 3),
    });
  }, []);

  const suggestedTopics = randomizedTopics[state.activeScenario] || [];

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
        />
      </div>
    </div>
  );
};
