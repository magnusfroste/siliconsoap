import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Minus, Plus } from 'lucide-react';

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
  compact?: boolean;
}

export const ConversationSettings = ({ rounds, setRounds, responseLength, setResponseLength, participationMode, setParticipationMode, turnOrder, setTurnOrder, compact = false }: ConversationSettingsProps) => {
  if (compact) return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Select value={participationMode} onValueChange={setParticipationMode}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="spectator">Spectator</SelectItem><SelectItem value="jump-in">Jump in</SelectItem><SelectItem value="round-by-round">Round by round</SelectItem></SelectContent></Select>
      <Select value={turnOrder} onValueChange={setTurnOrder}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sequential">Fixed turn order</SelectItem><SelectItem value="random">Random turns</SelectItem><SelectItem value="popcorn">Popcorn turns</SelectItem></SelectContent></Select>
    </div>
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-2">
        <span className="text-sm font-medium">Rounds</span>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" size="icon" className="h-11 w-11" onClick={() => setRounds(Math.max(1, rounds - 1))} disabled={rounds <= 1} aria-label="Decrease rounds"><Minus className="h-4 w-4" /></Button>
          <span className="min-w-10 text-center font-mono text-lg font-medium">{rounds}</span>
          <Button type="button" variant="outline" size="icon" className="h-11 w-11" onClick={() => setRounds(Math.min(10, rounds + 1))} disabled={rounds >= 10} aria-label="Increase rounds"><Plus className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="space-y-2">
        <span className="text-sm font-medium">Answer length</span>
        <div className="grid grid-cols-3 rounded-md bg-muted p-1">
          {[['short', 'Brief'], ['medium', 'Medium'], ['long', 'Detailed']].map(([value, label]) => <Button key={value} type="button" size="sm" variant={responseLength === value ? 'default' : 'ghost'} onClick={() => setResponseLength(value)}>{label}</Button>)}
        </div>
      </div>
    </div>
  );
};