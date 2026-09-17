import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, Lock } from 'lucide-react';
import { ScenarioSelector } from '@/components/labs/ScenarioSelector';
import { ConversationSettings } from '@/components/labs/agent-config/ConversationSettings';
import { AgentGridSection } from '@/components/labs/agent-config/AgentGridSection';
import { ExpertSettings } from '@/components/labs/agent-config/ExpertSettings';
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
import { getAgentSoapName } from '../utils/agentNameGenerator';
import { getAgreementLabel } from '@/components/labs/agent-config/ExpertSettings';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

export const NewChatView = () => {
  const isMounted = useRef(true);

  usePageMeta({
    title: 'Start a debate | SiliconSoap',
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

  // Honour ?model= and ?prompt= deep links (e.g. from the landing page).
  const [searchParams] = useSearchParams();
  const appliedDeepLink = useRef({ prompt: false, model: false });

  useEffect(() => {
    const promptParam = searchParams.get('prompt');
    if (promptParam && !appliedDeepLink.current.prompt) {
      appliedDeepLink.current.prompt = true;
      actions.handleInputChange(state.activeScenario, promptParam.slice(0, 1000));
    }
  }, [searchParams, state.activeScenario, actions]);

  useEffect(() => {
    const modelParam = searchParams.get('model');
    if (!modelParam || appliedDeepLink.current.model || state.availableModels.length === 0) return;
    const match = state.availableModels.find(
      (m) => m.model_id === modelParam && m.is_enabled !== false,
    );
    if (!match) return;
    appliedDeepLink.current.model = true;
    actions.setAgentAModel(match.model_id);
  }, [searchParams, state.availableModels, actions]);


  // Safety net: never send an empty/unknown persona to the debate engine.
  const { getTextValue } = useFeatureFlags();
  const resolvePersona = (persona: string, slot: 'a' | 'b' | 'c') => {
    const known = (value?: string | null) => !!value && profiles.some((profile) => profile.id === value);
    if (known(persona)) return persona;
    const flagDefault = getTextValue(`default_profile_agent_${slot}`);
    if (known(flagDefault)) return flagDefault;
    const hardDefault = slot === 'a' ? 'analytical' : slot === 'b' ? 'creative' : 'strategic';
    return hardDefault;
  };

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
      agentA: resolvePersona(state.agentAPersona, 'a'),
      agentB: resolvePersona(state.agentBPersona, 'b'),
      agentC: resolvePersona(state.agentCPersona, 'c')
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
  const selectedModels = [state.agentAModel, state.agentBModel, state.agentCModel]
    .slice(0, state.numberOfAgents)
    .map((id) => state.availableModels.find((model) => model.model_id === id));
  const personas = [state.agentAPersona, state.agentBPersona, state.agentCPersona];
  const answerLabel = state.responseLength === 'short' ? 'Brief' : state.responseLength === 'long' ? 'Detailed' : 'Medium';
  const rulesLine = `${state.rounds} ${state.rounds === 1 ? 'round' : 'rounds'} · ${answerLabel} answers · ${state.conversationTone[0].toUpperCase()}${state.conversationTone.slice(1)} · ${getAgreementLabel(state.agreementBias)}`;

  return (
    <div className="min-h-full min-w-0 px-4 pb-32 pt-8 md:px-8 md:pb-16 md:pt-12">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <div className="space-y-2">
          <h1 className="font-display text-4xl font-semibold md:text-5xl">Start a debate</h1>
          <p className="text-muted-foreground">
            Ask a hard question, cast the agents, set the rules.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid min-w-0 items-start gap-8 lg:grid-cols-12">
          <div className="min-w-0 space-y-6 lg:col-span-8">
            <ScenarioSelector
            scenarioTypes={scenarioTypes}
            activeScenario={state.activeScenario}
            setActiveScenario={actions.setActiveScenario}
            promptInputs={state.promptInputs}
            handleInputChange={actions.handleInputChange}
            suggestedTopics={suggestedTopics}
            />
            <AgentGridSection
                  numberOfAgents={state.numberOfAgents}
                  setNumberOfAgents={actions.setNumberOfAgents}
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
                  onShuffleModels={actions.shuffleModels}
                />
            <section className="min-w-0 max-w-full overflow-hidden space-y-6 rounded-lg border bg-card p-5 md:p-7">
              <div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">3</span><h2 className="font-display text-2xl font-semibold">Set the rules</h2></div>
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
                  participationMode={state.participationMode}
                  setParticipationMode={actions.setParticipationMode}
                  turnOrder={state.turnOrder}
                  setTurnOrder={actions.setTurnOrder}
                />
            </section>
          </div>

          <aside className="hidden rounded-lg bg-foreground p-6 text-background lg:sticky lg:top-8 lg:col-span-4 lg:block">
            <p className="text-xs font-semibold uppercase text-background/60">Your debate</p>
            <h2 className="mt-5 font-display text-3xl font-semibold leading-tight">{currentPrompt.trim() || 'Your question will appear here'}</h2>
            <div className="my-6 h-px bg-background/20" />
            <div className="space-y-4">{selectedModels.map((model, index) => <div key={model?.model_id || index} className="flex items-center gap-3"><span className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${index === 0 ? 'bg-agent-a-bg text-agent-a-fg' : index === 1 ? 'bg-agent-b-bg text-agent-b-fg' : 'bg-agent-c-bg text-agent-c-fg'}`}>{String.fromCharCode(65 + index)}</span><div className="min-w-0"><p className="font-medium">{getAgentSoapName(`Agent ${String.fromCharCode(65 + index)}`, personas[index])}</p><p className="truncate text-xs text-background/60">{model?.display_name || model?.model_id || 'Selecting model'} · {model?.origin_region || 'OTHER'}</p></div></div>)}</div>
            <p className="mt-6 text-sm text-background/70">{rulesLine}</p>
            <p className="mt-5 text-sm text-background/70">Public and shareable by link. {isGuest && <><Link to="/auth" className="underline text-background">Sign in</Link> to keep it private.</>}</p>
            <Button type="submit" variant="secondary" size="lg" className="mt-6 w-full justify-between" disabled={!currentPrompt.trim() || isGenerating}>{isGenerating ? <><Loader2 className="h-4 w-4 animate-spin" />Generating...</> : <>Start debate<ArrowRight className="h-4 w-4" /></>}</Button>
            <p className="mt-3 text-center text-xs text-background/60">Uses 1 {isGuest ? 'free debate' : 'credit'}</p>
          </aside>

          <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur lg:hidden">
            <div className="mx-auto max-w-lg"><p className="mb-2 truncate text-center text-xs text-muted-foreground">{state.numberOfAgents} agents · {state.rounds} rounds · Public {isGuest && <>· <Link to="/auth" className="underline">Sign in to keep it private</Link></>}</p><Button type="submit" size="lg" className="w-full" disabled={!currentPrompt.trim() || isGenerating}>{isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : 'Start debate'}</Button></div>
          </div>
          <div className="sr-only">
              {isGuest && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  <Link to="/auth" className="underline hover:text-primary transition-colors">Sign in</Link> to keep it private.
                </span>
              )}
          </div>
        </form>

        <CreditsExhaustedModal
          open={showCreditsModal}
          onOpenChange={setShowCreditsModal}
          isGuest={isGuest}
        />
      </div>
    </div>
  );
};
