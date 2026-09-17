import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface ExpertSettingsProps {
  conversationTone: 'formal' | 'casual' | 'heated' | 'collaborative';
  setConversationTone: (tone: 'formal' | 'casual' | 'heated' | 'collaborative') => void;
  agreementBias: number;
  setAgreementBias: (bias: number) => void;
  temperature: number;
  setTemperature: (temp: number) => void;
  personalityIntensity: 'mild' | 'moderate' | 'extreme';
  setPersonalityIntensity: (intensity: 'mild' | 'moderate' | 'extreme') => void;
  participationMode?: string;
  setParticipationMode?: (mode: string) => void;
  turnOrder?: string;
  setTurnOrder?: (order: string) => void;
}

export const getAgreementLabel = (bias: number) => bias < 30 ? "Devil's advocate" : bias > 70 ? 'Agreeable' : 'Balanced';

export function ExpertSettings({ conversationTone, setConversationTone, agreementBias, setAgreementBias, temperature, setTemperature, personalityIntensity, setPersonalityIntensity, participationMode = 'spectator', setParticipationMode, turnOrder = 'sequential', setTurnOrder }: ExpertSettingsProps) {
  const [open, setOpen] = useState(false);
  return <div className="space-y-6">
    <div className="space-y-2"><span className="text-sm font-medium">Tone</span><div className="grid grid-cols-2 rounded-md bg-muted p-1 sm:grid-cols-4">{(['formal', 'casual', 'heated', 'collaborative'] as const).map((tone) => <Button key={tone} type="button" size="sm" variant={conversationTone === tone ? 'default' : 'ghost'} onClick={() => setConversationTone(tone)} className="capitalize">{tone}</Button>)}</div></div>
    <div className="space-y-3"><div className="flex justify-between gap-4 text-sm"><span className="font-medium">How readily they agree</span><span className="text-muted-foreground">{agreementBias} · {getAgreementLabel(agreementBias)}</span></div><Slider value={[agreementBias]} onValueChange={(value) => setAgreementBias(value[0])} min={0} max={100} step={5} /><div className="flex justify-between text-xs text-muted-foreground"><span>Combative</span><span>Agreeable</span></div></div>
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild><Button type="button" variant="ghost" className="w-full justify-between px-0 text-muted-foreground">More settings — turn order, participation, temperature, persona intensity<ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} /></Button></CollapsibleTrigger>
      <CollapsibleContent className="grid gap-5 pt-4 sm:grid-cols-2">
        <div className="space-y-2"><span className="text-sm font-medium">Turn order</span><Select value={turnOrder} onValueChange={setTurnOrder}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sequential">Fixed order</SelectItem><SelectItem value="random">Random</SelectItem><SelectItem value="popcorn">Popcorn</SelectItem></SelectContent></Select></div>
        <div className="space-y-2"><span className="text-sm font-medium">Participation</span><Select value={participationMode} onValueChange={setParticipationMode}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="spectator">Spectator</SelectItem><SelectItem value="jump-in">Jump in</SelectItem><SelectItem value="round-by-round">Round by round</SelectItem></SelectContent></Select></div>
        <div className="space-y-3"><span className="text-sm font-medium">Temperature · {temperature.toFixed(1)}</span><Slider value={[temperature]} onValueChange={(value) => setTemperature(value[0])} min={0} max={1} step={0.1} /></div>
        <div className="space-y-2"><span className="text-sm font-medium">Persona intensity</span><Select value={personalityIntensity} onValueChange={setPersonalityIntensity}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="mild">Subtle</SelectItem><SelectItem value="moderate">Moderate</SelectItem><SelectItem value="extreme">Dramatic</SelectItem></SelectContent></Select></div>
      </CollapsibleContent>
    </Collapsible>
  </div>;
}