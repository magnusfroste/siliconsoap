
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
    <div className="border rounded-xl bg-card p-5 space-y-3 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm">
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
      
      {/* Large, prominent textarea */}
      <Textarea 
        placeholder={currentScenario?.placeholder || "Enter your topic..."}
        value={promptInputs[activeScenario] || ''}
        onChange={(e) => handleInputChange(activeScenario, e.target.value)}
        className="w-full min-h-[100px] resize-none text-base border-0 focus-visible:ring-0 bg-transparent px-0"
        rows={4}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = 'auto';
          target.style.height = `${target.scrollHeight}px`;
        }}
      />

      {/* Suggested Topics */}
      {suggestedTopics && suggestedTopics.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 pt-3 border-t border-border/20">
          {suggestedTopics.map((topic, idx) => (
            <span
              key={idx}
              className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted/50"
              onClick={() => handleInputChange(activeScenario, topic)}
            >
              {topic}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};