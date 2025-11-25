
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

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
  return (
    <div>
      <h3 className="text-xs font-medium mb-1">Conversation Scenario</h3>
      <Tabs 
        value={activeScenario} 
        onValueChange={setActiveScenario}
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 mb-4">
          {scenarioTypes.map(scenario => (
            <TabsTrigger 
              key={scenario.id} 
              value={scenario.id}
              className="flex items-center gap-2"
            >
              {scenario.icon}
              <span className="hidden sm:inline">{scenario.name}</span>
              <span className="sm:hidden text-xs">{scenario.name.split(' ')[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {scenarioTypes.map(scenario => (
          <TabsContent key={scenario.id} value={scenario.id} className="mt-0">
            <Textarea 
              placeholder={scenario.placeholder}
              value={promptInputs[scenario.id] || ''}
              onChange={(e) => handleInputChange(scenario.id, e.target.value)}
              className="w-full min-h-[3.5rem] resize-none"
              rows={2}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
