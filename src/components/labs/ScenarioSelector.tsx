
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
    <div className="border rounded-xl bg-card p-6 md:p-8 space-y-4 focus-within:ring-2 focus-within:ring-primary/30 transition-all shadow-md ring-1 ring-primary/5">
      {/* Pill-style scenario buttons */}
      <div className="flex justify-center gap-2 pb-3 border-b border-border/40">
        {scenarioTypes.map(scenario => (
          <Button
            key={scenario.id}
            type="button"
            variant={activeScenario === scenario.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveScenario(scenario.id)}
            className="flex items-center gap-2 transition-all"
          >
            {scenario.icon}
            <span className="hidden sm:inline">{scenario.name}</span>
            <span className="sm:hidden text-xs">{scenario.name.split(' ')[0]}</span>
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
          className="w-full min-h-[4rem] resize-none text-lg md:text-xl font-medium leading-snug border-0 focus-visible:ring-0 bg-transparent px-0 placeholder:text-muted-foreground/60 placeholder:font-normal placeholder:text-base"
          rows={2}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${target.scrollHeight}px`;
          }}
        />
      </div>

      {/* Suggested Topics — clickable chips */}
      {suggestedTopics && suggestedTopics.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-3 border-t border-border/20">
          <span className="text-xs text-muted-foreground/70 mr-1">Try one:</span>
          {suggestedTopics.map((topic, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleInputChange(activeScenario, topic)}
              className="max-w-full text-left text-xs rounded-full border border-border bg-muted/40 px-3 py-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              {topic}
            </button>
          ))}
        </div>
      )}
    </div>

  );
};