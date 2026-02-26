import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2, Settings, Shuffle } from 'lucide-react';
import { ScenarioSelector } from '@/components/labs/ScenarioSelector';
import { ConversationSettings } from '@/components/labs/agent-config/ConversationSettings';
import { AgentGridSection } from '@/components/labs/agent-config/AgentGridSection';
import { ExpertSettings } from '@/components/labs/agent-config/ExpertSettings';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
import { getAgentSoapName } from '../utils/agentNameGenerator';
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
  
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const { profiles } = useAgentProfiles();
  const [state, actions] = useLabsState();
  const { user } = useAuth();
  const { creditsRemaining, hasCredits, useCredit: deductCredit, isGuest, loading: creditsLoading, tokenBudgetRemaining } = useCredits(user?.id);
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const modelsByProvider = state.availableModels.reduce((acc, model) => {
    if (!acc[model.provider]) acc[model.provider] = [];
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

    if (creditsLoading) {
      toast.info('Loading credits...');
      return;
    }

    if (!hasCredits()) {
      setShowCreditsModal(true);
      return;
    }

    if (!isGuest && !user?.id) {
      toast.error('Please sign in to continue');
      return;
    }

    setIsGenerating(true);

    try {
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
      const modelsUsed: string[] = [settings.models.agentA];
      if (settings.numberOfAgents >= 2) modelsUsed.push(settings.models.agentB);
      if (settings.numberOfAgents >= 3) modelsUsed.push(settings.models.agentC);

      if (isGuest) {
        const guestChat = chatService.createGuestChat(currentPrompt, state.activeScenario, settings);
        analyticsService.logChatStart({
          chatId: guestChat.id, isGuest: true, promptPreview: currentPrompt,
          scenarioId: state.activeScenario, modelsUsed, numAgents: settings.numberOfAgents, numRounds: settings.rounds
        });
        if (isMounted.current) navigate(`/chat/${guestChat.id}`);
      } else {
        const chat = await chatService.createChat({
          user_id: user!.id, title, scenario_id: state.activeScenario,
          prompt: currentPrompt, settings
        });
        analyticsService.logChatStart({
          chatId: chat.id, userId: user!.id, isGuest: false, promptPreview: currentPrompt,
          scenarioId: state.activeScenario, modelsUsed, numAgents: settings.numberOfAgents, numRounds: settings.rounds
        });
        if (isMounted.current) navigate(`/chat/${chat.id}`);
      }
    } catch (error: any) {
      console.error('Error creating chat:', error);
      if (isMounted.current) {
        toast.error('Failed to create conversation', { description: error.message || 'Please try again' });
        setIsGenerating(false);
      }
    }
  };

  // Randomize topics on mount
  const [randomizedTopics, setRandomizedTopics] = useState<Record<string, string[]>>({});
  useEffect(() => {
    const hotDebates = suggestedTopicsByScenario['hot-debates'] || [];
    setRandomizedTopics({
      'general-problem': [...getRandomTopics(suggestedTopicsByScenario['general-problem'], 2), ...getRandomTopics(hotDebates, 1)],
      'ethical-dilemma': [...getRandomTopics(suggestedTopicsByScenario['ethical-dilemma'], 2), ...getRandomTopics(hotDebates, 1)],
      'future-prediction': [...getRandomTopics(suggestedTopicsByScenario['future-prediction'], 2), ...getRandomTopics(hotDebates, 1)],
    });
  }, []);

  const suggestedTopics = randomizedTopics[state.activeScenario] || [];

  // Get model display name helper
  const getModelDisplayName = (modelId: string) => {
    const model = state.availableModels.find(m => m.model_id === modelId);
    if (model) return model.display_name;
    // Fallback: extract name from model ID
    const parts = modelId.split('/');
    return parts.length > 1 ? parts[1] : modelId;
  };

  // Get persona display name
  const getPersonaName = (personaId: string) => {
    const profile = profiles.find(p => p.id === personaId);
    return profile?.name || 'Default';
  };

  // Build agent summaries for compact display
  const agentSummaries = [
    { letter: 'A', model: state.agentAModel, persona: state.agentAPersona, color: 'bg-purple-500' },
    ...(state.numberOfAgents >= 2 ? [{ letter: 'B', model: state.agentBModel, persona: state.agentBPersona, color: 'bg-blue-500' }] : []),
    ...(state.numberOfAgents >= 3 ? [{ letter: 'C', model: state.agentCModel, persona: state.agentCPersona, color: 'bg-green-500' }] : []),
  ];

  return (
    <div className="min-h-full flex flex-col items-center justify-start p-4 py-8 md:py-12">
      <div className="w-full max-w-4xl space-y-6 md:space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Set the Stage</h1>
          <p className="text-muted-foreground">
            Pick a topic, cast your AI agents, and watch the drama unfold
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Scenario + Prompt */}
          <ScenarioSelector
            scenarioTypes={scenarioTypes}
            activeScenario={state.activeScenario}
            setActiveScenario={actions.setActiveScenario}
            promptInputs={state.promptInputs}
            handleInputChange={actions.handleInputChange}
            suggestedTopics={suggestedTopics}
          />

          {/* 2. Agent Cast - compact cards showing name, model, persona */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Your Cast</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={actions.shuffleModels}
                className="h-7 gap-1.5 text-xs text-muted-foreground"
                type="button"
              >
                <Shuffle className="h-3 w-3" />
                Shuffle
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {agentSummaries.map((agent) => {
                const soapName = getAgentSoapName(`Agent ${agent.letter}`, agent.persona);
                return (
                  <div
                    key={agent.letter}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                  >
                    <div className={`h-8 w-8 rounded-full ${agent.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                      {agent.letter}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{soapName}</p>
                      <p className="text-xs text-muted-foreground truncate">{getModelDisplayName(agent.model)}</p>
                      {agent.persona && (
                        <p className="text-xs text-muted-foreground/70 truncate">{getPersonaName(agent.persona)}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Compact defaults summary */}
          <div className="flex flex-wrap items-center gap-2 justify-center">
            <Badge variant="secondary" className="text-xs">{state.numberOfAgents} Agents</Badge>
            <Badge variant="secondary" className="text-xs">{state.rounds} Rounds</Badge>
            <Badge variant="secondary" className="text-xs capitalize">{state.responseLength}</Badge>
            <Badge variant="secondary" className="text-xs capitalize">{state.participationMode === 'round-by-round' ? 'Interactive' : state.participationMode === 'jump-in' ? 'Jump In' : 'Spectator'}</Badge>
          </div>

          {/* 4. Expandable Settings */}
          <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-2 group">
              <Settings className="h-4 w-4" />
              <span>Customize Settings</span>
              <span className="text-xs opacity-50 group-hover:opacity-100 transition-opacity">
                {settingsOpen ? '−' : '+'}
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-6">
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

              {/* Full Agent Configuration */}
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
            </CollapsibleContent>
          </Collapsible>

          {/* 5. Start Debate CTA */}
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
                  Starting...
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4" />
                  Start Debate
                </>
              )}
            </Button>
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
