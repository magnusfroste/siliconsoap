
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
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  scenarioTypes,
  activeScenario,
  setActiveScenario,
  promptInputs,
  handleInputChange
}) => {
  const currentScenario = scenarioTypes.find(s => s.id === activeScenario);

  return (
    <div className="space-y-4">
      {/* Pill-style scenario buttons */}
      <div className="flex justify-center gap-2">
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
        className="w-full min-h-[100px] resize-none text-base"
        rows={4}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = 'auto';
          target.style.height = `${target.scrollHeight}px`;
        }}
      />
    </div>
  );
};