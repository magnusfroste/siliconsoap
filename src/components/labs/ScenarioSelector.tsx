
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export type ScenarioType = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  promptTemplate: (text: string) => string;
  followupTemplate: (text: string, prevResponse: string, otherResponse: string) => string;
  finalTemplate: (text: string, prevResponse: string, otherResponse: string) => string;
  placeholder: string;
};

interface ScenarioSelectorProps {
  scenarioTypes: ScenarioType[];
  activeScenario: string;
  setActiveScenario: (value: string) => void;
  promptInputs: {[key: string]: string};
  handleInputChange: (scenarioId: string, value: string) => void;
  suggestedTopics?: string[];
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  scenarioTypes,
  activeScenario,
  setActiveScenario,
  promptInputs,
  handleInputChange,
  suggestedTopics
}) => {
  const currentScenario = scenarioTypes.find(s => s.id === activeScenario);

  return (
    <section className="min-w-0 max-w-full overflow-hidden rounded-lg border bg-card p-5 md:p-7 space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">1</span>
        <h2 className="font-display text-2xl font-semibold">Ask a hard question</h2>
      </div>
      {/* Pill-style scenario buttons */}
      <div className="grid grid-cols-1 gap-1 rounded-md bg-muted p-1 sm:grid-cols-3">
        {scenarioTypes.map(scenario => (
          <Button
            key={scenario.id}
            type="button"
            variant={activeScenario === scenario.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveScenario(scenario.id)}
            className="h-auto min-h-10 whitespace-normal px-2 text-xs sm:text-sm"
          >
            <span>{scenario.name}</span>
          </Button>
        ))}
      </div>

      {/* Large, prominent topic field */}
      <div className="space-y-1.5">
        <label
          htmlFor="debate-topic"
          className="block text-xs font-medium uppercase tracking-wide text-muted-foreground"
        >
          Your question
        </label>
        <Textarea
          id="debate-topic"
          placeholder={currentScenario?.placeholder || "Enter your topic..."}
          value={promptInputs[activeScenario] || ''}
          onChange={(e) => handleInputChange(activeScenario, e.target.value)}
          className="min-h-32 resize-none border-input bg-background p-4 text-base leading-relaxed"
          rows={4}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${target.scrollHeight}px`;
          }}
        />
      </div>

      {/* Suggested Topics — clickable chips */}
      {suggestedTopics && suggestedTopics.length > 0 && (
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-1">Try one:</span>
          {suggestedTopics.map((topic, idx) => (
            <Button
              key={idx}
              type="button"
              onClick={() => handleInputChange(activeScenario, topic)}
              variant="outline"
              size="sm"
              className="h-auto max-w-full whitespace-normal break-words rounded-full py-1.5 text-left text-xs font-normal"
            >
              {topic}
            </Button>
          ))}
        </div>
      )}
    </section>

  );
};