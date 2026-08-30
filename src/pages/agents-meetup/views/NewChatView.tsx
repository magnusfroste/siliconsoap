import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Globe, Lock } from 'lucide-react';
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
import { getRandomTopics } from '../constants/suggestedTopics';
import { usePageMeta } from '@/hooks/usePageMeta';
import type { ChatSettings } from '@/models/chat';

export const NewChatView = () => {
  const isMounted = useRef(true);

  usePageMeta({
    title: 'Set the Stage for AI Drama',
    description: 'Watch AI agents clash, collaborate, and surprise you in dramatic debates. Choose your cast, set the scene, and let the drama unfold.',
    canonicalPath: '/new',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'New Episode', path: '/new' },
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
  const { creditsRemaining, hasCredits, useCredit: deductCredit, isGuest, loading: creditsLoading, tokenBudgetRemaining } = useCredits(user?.id);
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

    // Check credits/token budget before proceeding
    if (!hasCredits()) {
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
      // Deduct credit upfront for guests (simple credit system)
      // Logged-in users use token-based billing via useTokensForCredit
      if (isGuest) {
        const creditUsed = await deductCredit();
        if (!creditUsed) {
          setShowCreditsModal(true);
          setIsGenerating(false);
          return;
        }
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

  // Fetch quick prompts from DB, fallback to hardcoded
  const [randomizedTopics, setRandomizedTopics] = useState<Record<string, string[]>>({});
  
  useEffect(() => {
    const loadTopics = async () => {
      try {
        const { data } = await supabase
          .from('quick_prompts')
          .select('topic, scenario_id')
          .eq('is_enabled', true)
          .order('sort_order', { ascending: true });

        if (data && data.length > 0) {
          const byScenario: Record<string, string[]> = {};
          data.forEach(p => {
            if (!byScenario[p.scenario_id]) byScenario[p.scenario_id] = [];
            byScenario[p.scenario_id].push(p.topic);
          });
          const hotDebates = byScenario['hot-debates'] || [];
          
          setRandomizedTopics({
            'general-problem': [
              ...getRandomTopics(byScenario['general-problem'] || [], 2),
              ...getRandomTopics(hotDebates, 1)
            ],
            'ethical-dilemma': [
              ...getRandomTopics(byScenario['ethical-dilemma'] || [], 2),
              ...getRandomTopics(hotDebates, 1)
            ],
            'future-prediction': [
              ...getRandomTopics(byScenario['future-prediction'] || [], 2),
              ...getRandomTopics(hotDebates, 1)
            ],
          });
        }
      } catch (err) {
        console.error('Failed to load quick prompts:', err);
      }
    };
    loadTopics();
  }, []);

  const suggestedTopics = randomizedTopics[state.activeScenario] || [];

  return (
    <div className="min-h-full flex flex-col items-center justify-start p-4 py-8 md:py-12">
      <div className="w-full max-w-4xl space-y-6 md:space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Set the Stage</h1>
          <p className="text-muted-foreground">
            Pick a topic, cast your AI agents, and watch the drama unfold
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

          {/* Configuration Card — de-emphasised until the user engages with it.
              The dimming is applied via an overlay veil instead of opacity on the
              content, so nothing sits on top of (and obscures) the agent cards. */}
          <div className="group relative">
            <p className="hidden md:block text-center text-xs text-muted-foreground mb-2 transition-opacity duration-300 group-hover:opacity-0 group-focus-within:opacity-0">
              Defaults are ready to go — hover to fine-tune your cast &amp; settings
            </p>
            <div
              aria-hidden="true"
              className="hidden md:block pointer-events-none absolute inset-x-0 bottom-0 top-6 z-10 rounded-xl bg-background/55 transition-opacity duration-500 group-hover:opacity-0 group-focus-within:opacity-0"
            />
            <Card className="md:group-hover:shadow-lg md:group-focus-within:shadow-lg transition-shadow duration-500">

              <CardContent className="pt-6 space-y-4">
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
                  onShuffleModels={actions.shuffleModels}
                />

                <Separator className="my-4" />

                {/* Conversation Settings + Advanced */}
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
              </CardContent>
            </Card>
          </div>
          
          <div className="flex flex-col items-center gap-3">
            <div className="flex flex-wrap justify-center items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-2 text-sm text-foreground">
              <Globe className="h-4 w-4 text-primary" />
              <span>Your debate will be <strong>public</strong> and shareable via link.</span>
              {isGuest && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  <a href="/login" className="underline hover:text-primary transition-colors">Sign in</a> to keep it private.
                </span>
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              <Button
                type="submit"
                size="lg"
                className="gap-2 px-8 text-base shadow-md"
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
                    Start Debate
                  </>
                )}
              </Button>
              {!currentPrompt.trim() && !isGenerating && (
                <p className="text-xs text-muted-foreground">
                  Enter your question above to start
                </p>
              )}
            </div>
          </div>

        </form>

        {!user && (
          <div className="text-center text-sm text-muted-foreground">
            🎬 Sign in to save your episodes and analyze the drama
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
