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
  isExpanded?: boolean;
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
  isExpanded = true,
}: ExpertSettingsProps) {

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

  if (!isExpanded) return null;

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 gap-4 pt-2">
        {/* Conversation Tone */}
          <div className="space-y-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Label className="text-sm font-medium cursor-help">Conversation Tone</Label>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Sets the overall style and energy of the conversation</p>
              </TooltipContent>
            </Tooltip>
            <Select value={conversationTone} onValueChange={setConversationTone}>
              <SelectTrigger>
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
          <div className="space-y-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Label className="text-sm font-medium cursor-help">Personality Intensity</Label>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">How strongly agents embody their persona characteristics</p>
              </TooltipContent>
            </Tooltip>
            <Select value={personalityIntensity} onValueChange={setPersonalityIntensity}>
              <SelectTrigger>
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label className="text-sm font-medium cursor-help">Agreement Bias</Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Controls how much agents agree or disagree with each other</p>
                </TooltipContent>
              </Tooltip>
              <span className="text-sm text-muted-foreground">{getAgreementLabel(agreementBias)}</span>
            </div>
            <Slider
              value={[agreementBias]}
              onValueChange={(value) => setAgreementBias(value[0])}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Devil's Advocate</span>
              <span>Yes, And!</span>
            </div>
          </div>

          {/* Temperature/Creativity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label className="text-sm font-medium cursor-help">Creativity</Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Higher values make responses more creative and unpredictable</p>
                </TooltipContent>
              </Tooltip>
              <span className="text-sm text-muted-foreground">{getTemperatureLabel(temperature)}</span>
            </div>
            <Slider
              value={[temperature]}
              onValueChange={(value) => setTemperature(value[0])}
              min={0}
              max={1}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>By the Book</span>
              <span>Wild Card</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
