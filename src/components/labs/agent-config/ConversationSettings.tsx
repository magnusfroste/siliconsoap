
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
  participationMode: string;
  setParticipationMode: (mode: string) => void;
  responseLengthOptions: { value: string; label: string; icon: React.ReactNode }[];
}

export const ConversationSettings: React.FC<ConversationSettingsProps> = ({
  numberOfAgents,
  setNumberOfAgents,
  rounds,
  setRounds,
  responseLength,
  setResponseLength,
  participationMode,
  setParticipationMode,
  responseLengthOptions,
}) => {
  const agentLabels: Record<string, { short: string; full: string }> = {
    '1': { short: '1 Agent', full: '1 Agent (Solo Analysis)' },
    '2': { short: '2 Agents', full: '2 Agents (Discussion)' },
    '3': { short: '3 Agents', full: '3 Agents (Multi-perspective)' }
  };

  const roundLabels: Record<string, { short: string; full: string }> = {
    '1': { short: '1 Round', full: '1 Round (Initial responses)' },
    '2': { short: '2 Rounds', full: '2 Rounds (With follow-up)' },
    '3': { short: '3 Rounds', full: '3 Rounds (Extended dialogue)' }
  };

  const participationLabels: Record<string, { short: string; full: string }> = {
    'spectator': { short: 'Spectator', full: 'Spectator (Watch Only)' },
    'jump-in': { short: 'Jump In', full: 'Jump In (Comment After)' },
    'round-by-round': { short: 'Round-by-Round', full: 'Round-by-Round (Interactive)' }
  };

  const responseLengthLabels: Record<string, string> = {
    'short': 'Short',
    'medium': 'Medium',
    'long': 'Long'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <Select value={numberOfAgents.toString()} onValueChange={(value) => setNumberOfAgents(parseInt(value))}>
          <SelectTrigger className="h-10 text-sm">
            <span>{agentLabels[numberOfAgents.toString()]?.short || 'Number of agents'}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">{agentLabels['1'].full}</SelectItem>
            <SelectItem value="2">{agentLabels['2'].full}</SelectItem>
            <SelectItem value="3">{agentLabels['3'].full}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Select 
          value={rounds.toString()} 
          onValueChange={(value) => setRounds(parseInt(value))}
          disabled={numberOfAgents === 1}
        >
          <SelectTrigger className="h-10 text-sm">
            <span>{roundLabels[rounds.toString()]?.short || 'Exchange rounds'}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">{roundLabels['1'].full}</SelectItem>
            <SelectItem value="2">{roundLabels['2'].full}</SelectItem>
            <SelectItem value="3">{roundLabels['3'].full}</SelectItem>
          </SelectContent>
        </Select>
        {numberOfAgents === 1 && (
          <p className="text-xs text-muted-foreground mt-1">Only one round available with one agent</p>
        )}
      </div>
      
      <div>
        <Select value={responseLength} onValueChange={(value) => setResponseLength(value)}>
          <SelectTrigger className="h-10 text-sm">
            <span>{responseLengthLabels[responseLength] || 'Response length'}</span>
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
      
      <div>
        <Select value={participationMode} onValueChange={(value) => setParticipationMode(value)}>
          <SelectTrigger className="h-10 text-sm">
            <span>{participationLabels[participationMode]?.short || 'Participation'}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="spectator">{participationLabels['spectator'].full}</SelectItem>
            <SelectItem value="jump-in">{participationLabels['jump-in'].full}</SelectItem>
            <SelectItem value="round-by-round">{participationLabels['round-by-round'].full}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
