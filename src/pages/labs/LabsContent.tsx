
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Atom, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { 
  APIKeyInput,
  ProgressStepper,
  AgentConfigSection,
  ConversationCard,
  ConversationAnalysis
} from '@/components/labs';
import { useLabsState } from './hooks/useLabsState';
import { profiles, responseLengthOptions, scenarioTypes } from './constants';

const LabsContent: React.FC = () => {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="inline-block p-3 rounded-full bg-purple-100 mb-4">
              <Atom className="h-8 w-8 text-purple-600" />
            </div>
            <h1 className="text-4xl font-bold mb-4">AI Agents Meetup</h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Watch AI agents with different profiles collaborate to solve problems. Configure each agent's model and profile to see how diversity of thought leads to better outcomes.
            </p>
          </div>

          <ProgressStepper currentStep={state.currentStep} goToStep={actions.goToStep} />

          <div className="mt-8">
            {state.currentStep === 1 && (
              <APIKeyInput 
                apiKey={state.apiKey}
                setApiKey={actions.setApiKey}
                savedApiKey={state.savedApiKey}
                isSaving={state.isSaving}
                isSaved={state.isSaved}
                isUsingEnvKey={state.isUsingEnvKey}
                saveApiKey={actions.saveApiKey}
                goToStep={actions.goToStep}
              />
            )}
            
            {state.currentStep === 2 && (
              <AgentConfigSection
                numberOfAgents={state.numberOfAgents}
                setNumberOfAgents={actions.setNumberOfAgents}
                rounds={state.rounds}
                setRounds={actions.setRounds}
                responseLength={state.responseLength}
                setResponseLength={(length: string) => actions.setResponseLength(length as any)}
                responseLengthOptions={responseLengthOptions}
                scenarioTypes={scenarioTypes}
                activeScenario={state.activeScenario}
                setActiveScenario={actions.setActiveScenario}
                promptInputs={state.promptInputs}
                handleInputChange={actions.handleInputChange}
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
                modelsByProvider={state.availableModels.reduce((acc, model) => {
                  if (!acc[model.provider]) {
                    acc[model.provider] = [];
                  }
                  acc[model.provider].push(model);
                  return acc;
                }, {} as Record<string, any[]>)}
                loadingModels={state.loadingModels}
                goToStep={actions.goToStep}
                handleStartConversation={actions.handleStartConversation}
                isLoading={state.isLoading}
                getCurrentPrompt={actions.getCurrentPrompt}
                savedApiKey={state.savedApiKey}
              />
            )}
            
            {state.currentStep === 3 && (
              <>
                {state.conversation.length === 0 && state.isLoading && (
                  <div className="flex justify-center items-center mb-8">
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-10 w-10 animate-spin text-purple-500 mb-4" />
                      <p className="text-gray-600">Starting conversation with AI agents...</p>
                    </div>
                  </div>
                )}
                <ConversationCard
                  conversation={state.conversation}
                  isLoading={state.isLoading}
                  profiles={profiles}
                  getCurrentScenario={actions.getCurrentScenario}
                  getCurrentPrompt={actions.getCurrentPrompt}
                  goToStep={actions.goToStep}
                  availableModels={state.availableModels}
                  formatMessage={actions.formatMessage}
                />
              </>
            )}
            
            {state.currentStep === 4 && (
              <ConversationAnalysis
                conversation={state.conversation}
                isLoading={state.isLoading}
                isAnalyzing={state.isAnalyzing}
                analysisResults={state.analysisResults}
                handleAnalyzeConversation={actions.handleAnalyzeConversation}
                goToStep={actions.goToStep}
                analyzerModel={state.analyzerModel}
                availableModels={state.availableModels}
                setAnalyzerModel={actions.setAnalyzerModel}
              />
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-sm text-gray-600 mt-8">
            <h2 className="text-lg font-semibold mb-2">About OpenRouter Integration</h2>
            <p className="mb-2">
              This demo uses <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">OpenRouter</a> to access multiple AI models through a single API. 
              If you would like to play with non-free models, sign up for an OpenRouter account and enter your API key to use models from providers like OpenAI, Anthropic, and Mistral.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LabsContent;
