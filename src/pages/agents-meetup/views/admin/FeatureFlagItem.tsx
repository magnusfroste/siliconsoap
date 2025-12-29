import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProfileSelector } from '../components/ProfileSelector';
// Note: Model defaults are now hardcoded in ModelsContext.tsx (single source of truth)
// The feature flag approach for model defaults has been removed

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string | null;
  enabled: boolean;
  numeric_value: number | null;
  text_value: string | null;
}

interface FeatureFlagItemProps {
  flag: FeatureFlag;
  onToggle: (flagId: string, currentEnabled: boolean) => void;
  onNumericChange: (flagId: string, value: string) => void;
  onTextChange: (flagId: string, value: string) => void;
}

const SELECT_OPTIONS: Record<string, { value: string; label: string }[]> = {
  'default_response_length': [
    { value: 'short', label: 'Short' },
    { value: 'medium', label: 'Medium' },
    { value: 'long', label: 'Long' }
  ],
  'default_participation_mode': [
    { value: 'spectator', label: 'Spectator (Watch Only)' },
    { value: 'jump-in', label: 'Jump In (Comment After)' },
    { value: 'round-by-round', label: 'Round-by-Round (Interactive)' }
  ],
  'default_turn_order': [
    { value: 'sequential', label: 'Sequential' },
    { value: 'random', label: 'Random' },
    { value: 'popcorn', label: 'Popcorn' }
  ],
  'default_conversation_tone': [
    { value: 'formal', label: 'Formal Debate' },
    { value: 'casual', label: 'Casual Chat' },
    { value: 'heated', label: 'Heated Discussion' },
    { value: 'collaborative', label: 'Collaborative' }
  ],
  'default_personality_intensity': [
    { value: 'mild', label: 'Mild' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'extreme', label: 'Extreme' }
  ]
};

// Model defaults are now hardcoded in ModelsContext.tsx - these keys are deprecated and hidden
const DEPRECATED_MODEL_KEYS = ['default_model_agent_a', 'default_model_agent_b', 'default_model_agent_c'];
const PROFILE_KEYS = ['default_profile_agent_a', 'default_profile_agent_b', 'default_profile_agent_c'];

export const FeatureFlagItem = ({ flag, onToggle, onNumericChange, onTextChange }: FeatureFlagItemProps) => {
  // Skip deprecated model keys - defaults are now in ModelsContext.tsx
  if (DEPRECATED_MODEL_KEYS.includes(flag.key)) {
    return null;
  }
  
  const isProfileSelector = PROFILE_KEYS.includes(flag.key);
  const hasSelectOptions = SELECT_OPTIONS[flag.key]?.length > 0;

  return (
    <div className="flex items-start justify-between space-x-4 p-4 rounded-lg border border-border/40 bg-background/50">
      <div className="flex-1 space-y-1">
        <Label htmlFor={flag.id} className="text-base font-medium cursor-pointer">
          {flag.name}
        </Label>
        {flag.description && (
          <p className="text-sm text-muted-foreground">{flag.description}</p>
        )}
        <p className="text-xs text-muted-foreground/60 font-mono">{flag.key}</p>
        
        {flag.numeric_value !== null && (
          <div className="pt-2">
            <Input
              type="number"
              min="0"
              value={flag.numeric_value}
              onChange={(e) => onNumericChange(flag.id, e.target.value)}
              className="w-32"
            />
          </div>
        )}
        
        {flag.text_value !== null && isProfileSelector && (
          <div className="pt-2">
            <ProfileSelector
              value={flag.text_value}
              onChange={(value) => onTextChange(flag.id, value)}
            />
          </div>
        )}
        
        {flag.text_value !== null && !isProfileSelector && hasSelectOptions && (
          <div className="pt-2">
            <Select
              value={flag.text_value}
              onValueChange={(value) => onTextChange(flag.id, value)}
            >
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SELECT_OPTIONS[flag.key].map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <Switch
        id={flag.id}
        checked={flag.enabled}
        onCheckedChange={() => onToggle(flag.id, flag.enabled)}
      />
    </div>
  );
};
