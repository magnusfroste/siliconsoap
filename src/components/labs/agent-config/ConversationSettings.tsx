
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  turnOrder: string;
  setTurnOrder: (order: string) => void;
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
  turnOrder,
  setTurnOrder,
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

  const turnOrderLabels: Record<string, { short: string; full: string }> = {
    'sequential': { short: 'Sequential', full: 'Sequential (A→B→C)' },
    'random': { short: 'Random', full: 'Random (Shuffled)' },
    'popcorn': { short: 'Popcorn', full: 'Popcorn (AI-driven)' }
  };

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>Choose how many AI agents will participate in the conversation. More agents provide diverse perspectives but take longer to complete.</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>Number of back-and-forth exchanges between agents. More rounds create deeper discussions as agents build on each other's insights.</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>Control how verbose agent responses are. Short responses are concise, medium provides balanced detail, and long offers comprehensive analysis.</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>Choose your interaction level: watch agents discuss without interruption, comment after all rounds complete, or participate between each round of discussion.</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Select 
                value={turnOrder} 
                onValueChange={(value) => setTurnOrder(value)}
                disabled={numberOfAgents === 1}
              >
                <SelectTrigger className="h-10 text-sm">
                  <span>{turnOrderLabels[turnOrder]?.short || 'Turn Order'}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sequential">{turnOrderLabels['sequential'].full}</SelectItem>
                  <SelectItem value="random">{turnOrderLabels['random'].full}</SelectItem>
                  <SelectItem value="popcorn">{turnOrderLabels['popcorn'].full}</SelectItem>
                </SelectContent>
              </Select>
              {numberOfAgents === 1 && (
                <p className="text-xs text-muted-foreground mt-1">Turn order only applies with multiple agents</p>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>Control agent speaking order: Sequential follows A→B→C pattern, Random shuffles each round, and Popcorn uses AI to select the most relevant speaker based on context.</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};
