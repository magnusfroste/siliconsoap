import { Settings } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

interface ExpertSettingsProps {
  conversationTone: 'formal' | 'casual' | 'heated' | 'collaborative';
  setConversationTone: (tone: 'formal' | 'casual' | 'heated' | 'collaborative') => void;
  agreementBias: number;
  setAgreementBias: (bias: number) => void;
  temperature: number;
  setTemperature: (temp: number) => void;
  personalityIntensity: 'mild' | 'moderate' | 'extreme';
  setPersonalityIntensity: (intensity: 'mild' | 'moderate' | 'extreme') => void;
}

export function ExpertSettings({
  conversationTone,
  setConversationTone,
  agreementBias,
  setAgreementBias,
  temperature,
  setTemperature,
  personalityIntensity,
  setPersonalityIntensity,
}: ExpertSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toneOptions = [
    { value: 'formal', label: '🎓 Formal Debate', description: 'Academic rigor and professional discourse' },
    { value: 'casual', label: '☕ Casual Chat', description: 'Friendly, everyday conversation' },
    { value: 'heated', label: '🔥 Heated Discussion', description: 'Passionate and assertive viewpoints' },
    { value: 'collaborative', label: '🤝 Collaborative', description: 'Building on ideas together' },
  ];

  const intensityOptions = [
    { value: 'mild', label: 'Mild', description: 'Subtle persona expression' },
    { value: 'moderate', label: 'Moderate', description: 'Clear persona characteristics' },
    { value: 'extreme', label: 'Extreme', description: 'Strongly embodied persona' },
  ];

  const getAgreementLabel = (bias: number) => {
    if (bias < 30) return "Devil's Advocate";
    if (bias > 70) return "Yes, And!";
    return "Balanced";
  };

  const getTemperatureLabel = (temp: number) => {
    if (temp < 0.3) return "By the Book";
    if (temp > 0.8) return "Wild Card";
    return "Creative";
  };

  return (
    <TooltipProvider>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center gap-3 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors w-full py-3 group">
          <Settings className="h-4 w-4 transition-transform duration-200" />
          <span>Advanced</span>
          <span className="ml-auto text-xs opacity-50 group-hover:opacity-100 transition-opacity">
            {isOpen ? '−' : '+'}
          </span>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="pt-6 space-y-6">
          {/* Conversation Tone */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Conversation Tone</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                    <Settings className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p className="max-w-xs text-xs">Sets the overall style and energy of the conversation</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Select value={conversationTone} onValueChange={setConversationTone}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col items-start">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Personality Intensity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Personality Intensity</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                    <Settings className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p className="max-w-xs text-xs">How strongly agents embody their persona characteristics</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Select value={personalityIntensity} onValueChange={setPersonalityIntensity}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {intensityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col items-start">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Agreement Bias */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Agreement Bias</Label>
              <span className="text-xs font-medium text-muted-foreground">{getAgreementLabel(agreementBias)}</span>
            </div>
            <Slider
              value={[agreementBias]}
              onValueChange={(value) => setAgreementBias(value[0])}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground/60">
              <span>Disagree</span>
              <span>Agree</span>
            </div>
          </div>

          {/* Temperature/Creativity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Creativity</Label>
              <span className="text-xs font-medium text-muted-foreground">{getTemperatureLabel(temperature)}</span>
            </div>
            <Slider
              value={[temperature]}
              onValueChange={(value) => setTemperature(value[0])}
              min={0}
              max={1}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground/60">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </TooltipProvider>
  );
}
