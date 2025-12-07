import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Atom, Settings, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { 
  QuickTopicInput,
  ConversationCard,
  ConversationAnalysis,
  SettingsDrawer
} from '@/components/labs';
import { useLabsState } from './hooks/useLabsState';
import { responseLengthOptions, scenarioTypes } from './constants';
import { useAgentProfiles } from '@/hooks/useAgentProfiles';

const AgentsMeetup: React.FC = () => {
  const { profiles } = useAgentProfiles();
  const formA = useForm({
    defaultValues: { persona: 'analytical' }
  });

  const formB = useForm({
    defaultValues: { persona: 'creative' }
  });

  const formC = useForm({
    defaultValues: { persona: 'strategic' }
  });

  const [state, actions] = useLabsState();
  
  // Auto-load models on mount with shared API key
  // Models are now auto-loaded by useModels hook, no need for manual initialization

  const showConversation = state.conversation.length > 0 || state.isLoading;
  const showAnalysis = state.analysisResults && !state.isLoading;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Hero Section */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="inline-flex items-center gap-2">
              <Atom className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">AI Agents Meetup</h1>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => actions.setSettingsOpen(true)}
              className="flex items-center gap-1.5"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            
            {state.isUsingSharedKey && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                OpenRouter
              </Badge>
            )}
          </div>

          {/* Main Content Area */}
          <div className="space-y-8">
            {/* Topic Input - Always visible at top */}
            {!showConversation && (
              <QuickTopicInput
                scenarioTypes={scenarioTypes}
                activeScenario={state.activeScenario}
                setActiveScenario={actions.setActiveScenario}
                promptInputs={state.promptInputs}
                handleInputChange={actions.handleInputChange}
                handleStartConversation={actions.handleStartConversation}
                isLoading={state.isLoading}
                getCurrentPrompt={actions.getCurrentPrompt}
              />
            )}

            {/* Conversation Display */}
            {showConversation && (
              <ConversationCard
                conversation={state.conversation}
                isLoading={state.isLoading}
                profiles={profiles}
                getCurrentScenario={actions.getCurrentScenario}
                getCurrentPrompt={actions.getCurrentPrompt}
                goToStep={(step) => {
                  if (step === 2 || step === 1) {
                    // Reset to input view
                    actions.setCurrentView('input');
                    actions.setConversation([]);
                  }
                }}
                availableModels={state.availableModels}
                formatMessage={actions.formatMessage}
              />
            )}

            {/* Analysis Section - Inline after conversation */}
            {showAnalysis && (
              <ConversationAnalysis
                conversation={state.conversation}
                isLoading={state.isLoading}
                isAnalyzing={state.isAnalyzing}
                analysisResults={state.analysisResults}
                handleAnalyzeConversation={actions.handleAnalyzeConversation}
                goToStep={(step) => {
                  // Just scroll back up to conversation
                }}
                analyzerModel={state.analyzerModel}
                availableModels={state.availableModels}
                setAnalyzerModel={actions.setAnalyzerModel}
              />
            )}

            {/* Info Section */}
            {!showConversation && (
              <div className="bg-muted/50 rounded-lg p-6 border text-sm">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-2">Powered by OpenRouter</h3>
                    <p className="text-muted-foreground mb-3">
                      This demo uses OpenRouter to access multiple AI models. Start creating AI conversations right away!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* Settings Drawer */}
      <SettingsDrawer
        open={state.settingsOpen}
        onOpenChange={actions.setSettingsOpen}
        numberOfAgents={state.numberOfAgents}
        setNumberOfAgents={actions.setNumberOfAgents}
        rounds={state.rounds}
        setRounds={actions.setRounds}
        responseLength={state.responseLength}
        setResponseLength={(length: string) => actions.setResponseLength(length as any)}
        participationMode={state.participationMode}
        setParticipationMode={(mode: string) => actions.setParticipationMode(mode as any)}
        turnOrder={state.turnOrder}
        setTurnOrder={(order: string) => actions.setTurnOrder(order as any)}
        responseLengthOptions={responseLengthOptions}
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
        formA={formA}
        formB={formB}
        formC={formC}
        modelsByProvider={state.availableModels.length > 0 ? 
          state.availableModels.reduce((acc, model) => {
            if (!acc[model.provider]) {
              acc[model.provider] = [];
            }
            acc[model.provider].push(model);
            return acc;
          }, {} as Record<string, any[]>) : 
          {}
        }
        loadingModels={state.loadingModels}
        isUsingSharedKey={state.isUsingSharedKey}
      />
    </div>
  );
};

export default AgentsMeetup;
