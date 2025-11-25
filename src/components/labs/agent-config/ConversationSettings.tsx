
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap } from 'lucide-react';
import { ResponseLength } from '@/pages/labs/projects/agents-meetup/types';

interface ConversationSettingsProps {
  numberOfAgents: number;
  setNumberOfAgents: (num: number) => void;
  rounds: number;
  setRounds: (num: number) => void;
  responseLength: string;
  setResponseLength: (length: string) => void;
  responseLengthOptions: { value: string; label: string; icon: React.ReactNode }[];
}

export const ConversationSettings: React.FC<ConversationSettingsProps> = ({
  numberOfAgents,
  setNumberOfAgents,
  rounds,
  setRounds,
  responseLength,
  setResponseLength,
  responseLengthOptions,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <h3 className="text-xs font-medium mb-1">Number of Agents</h3>
        <Select value={numberOfAgents.toString()} onValueChange={(value) => setNumberOfAgents(parseInt(value))}>
          <SelectTrigger className="h-10 text-sm">
            <SelectValue placeholder="Select number of agents" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 Agent (Solo Analysis)</SelectItem>
            <SelectItem value="2">2 Agents (Discussion)</SelectItem>
            <SelectItem value="3">3 Agents (Multi-perspective)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <h3 className="text-xs font-medium mb-1">Number of Exchange Rounds</h3>
        <Select 
          value={rounds.toString()} 
          onValueChange={(value) => setRounds(parseInt(value))}
          disabled={numberOfAgents === 1}
        >
          <SelectTrigger className="h-10 text-sm">
            <SelectValue placeholder="Select rounds" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 Round (Initial responses)</SelectItem>
            <SelectItem value="2">2 Rounds (With follow-up)</SelectItem>
            <SelectItem value="3">3 Rounds (Extended dialogue)</SelectItem>
          </SelectContent>
        </Select>
        {numberOfAgents === 1 && (
          <p className="text-xs text-gray-500 mt-1">Only one round available with one agent</p>
        )}
      </div>
      
      <div>
        <h3 className="text-xs font-medium mb-1">Response Length</h3>
        <Select value={responseLength} onValueChange={(value) => setResponseLength(value)}>
          <SelectTrigger className="h-10 text-sm">
            <SelectValue placeholder="Select length" />
          </SelectTrigger>
          <SelectContent>
            {responseLengthOptions.map(option => (
              <SelectItem key={option.value} value={option.value} className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  {option.icon}
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
