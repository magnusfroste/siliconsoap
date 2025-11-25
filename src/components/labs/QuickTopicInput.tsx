import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2 } from 'lucide-react';
import { ScenarioType } from './ScenarioSelector';

interface QuickTopicInputProps {
  scenarioTypes: ScenarioType[];
  activeScenario: string;
  setActiveScenario: (scenario: string) => void;
  promptInputs: Record<string, string>;
  handleInputChange: (scenarioId: string, value: string) => void;
  handleStartConversation: () => void;
  isLoading: boolean;
  getCurrentPrompt: () => string;
}

export const QuickTopicInput: React.FC<QuickTopicInputProps> = ({
  scenarioTypes,
  activeScenario,
  setActiveScenario,
  promptInputs,
  handleInputChange,
  handleStartConversation,
  isLoading,
  getCurrentPrompt
}) => {
  const currentScenario = scenarioTypes.find(s => s.id === activeScenario) || scenarioTypes[0];
  const currentPrompt = getCurrentPrompt();

  return (
    <Card className="border-2 border-primary/20">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">What should the agents discuss?</h3>
          </div>

          <Textarea
            placeholder={currentScenario.placeholder}
            value={promptInputs[activeScenario] || ''}
            onChange={(e) => handleInputChange(activeScenario, e.target.value)}
            className="min-h-[120px] text-base"
            disabled={isLoading}
          />

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Quick picks:</p>
            <div className="flex flex-wrap gap-2">
              {scenarioTypes.map((scenario) => (
                <Button
                  key={scenario.id}
                  variant={activeScenario === scenario.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveScenario(scenario.id)}
                  disabled={isLoading}
                  className="flex items-center gap-1.5"
                >
                  {scenario.icon}
                  <span>{scenario.name}</span>
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleStartConversation}
            disabled={isLoading || !currentPrompt.trim()}
            className="w-full h-12 text-base"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Agents are conversing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Start Conversation
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
