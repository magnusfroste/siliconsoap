import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';
import { CuratedModelSelector } from './components/CuratedModelSelector';
import { ProfileSelector } from './components/ProfileSelector';
import { CuratedModelsManager } from './components/CuratedModelsManager';

export const AdminView = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const { flags, loading: flagsLoading, refetch } = useFeatureFlags();

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast.error('Access denied');
      navigate('/new');
    }
  }, [isAdmin, adminLoading, navigate]);

  const handleToggle = async (flagId: string, currentEnabled: boolean) => {
    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ enabled: !currentEnabled })
        .eq('id', flagId);

      if (error) throw error;

      toast.success(`Feature ${!currentEnabled ? 'enabled' : 'disabled'}`);
      refetch();
    } catch (error) {
      console.error('Error updating feature flag:', error);
      toast.error('Failed to update feature flag');
    }
  };

  const handleNumericValueChange = async (flagId: string, value: string) => {
    const numericValue = parseInt(value, 10);
    if (isNaN(numericValue) || numericValue < 0) return;

    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ numeric_value: numericValue })
        .eq('id', flagId);

      if (error) throw error;

      toast.success('Value updated successfully');
      refetch();
    } catch (error) {
      console.error('Error updating numeric value:', error);
      toast.error('Failed to update value');
    }
  };

  const handleTextValueChange = async (flagId: string, value: string) => {
    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ text_value: value })
        .eq('id', flagId);

      if (error) throw error;

      toast.success('Value updated successfully');
      refetch();
    } catch (error) {
      console.error('Error updating text value:', error);
      toast.error('Failed to update value');
    }
  };

  const getSelectOptions = (key: string): { value: string; label: string }[] => {
    const optionsMap: Record<string, { value: string; label: string }[]> = {
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
    return optionsMap[key] || [];
  };

  if (adminLoading || flagsLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const agentDefaultFlags = flags.filter(f => 
    f.key.startsWith('default_profile_agent_') || f.key.startsWith('default_model_agent_')
  );
  
  const conversationSettingsFlags = flags.filter(f => 
    ['default_number_of_agents', 'default_rounds', 'default_response_length', 'default_participation_mode', 'default_turn_order'].includes(f.key)
  );
  
  const expertSettingsFlags = flags.filter(f => 
    ['default_conversation_tone', 'default_agreement_bias', 'default_temperature', 'default_personality_intensity'].includes(f.key)
  );
  
  const featureToggleFlags = flags.filter(f => 
    !agentDefaultFlags.includes(f) && 
    !conversationSettingsFlags.includes(f) && 
    !expertSettingsFlags.includes(f)
  );

  const renderFlag = (flag: typeof flags[0]) => (
    <div
      key={flag.id}
      className="flex items-start justify-between space-x-4 p-4 rounded-lg border border-border/40"
    >
      <div className="flex-1 space-y-1">
        <Label htmlFor={flag.id} className="text-base font-medium cursor-pointer">
          {flag.name}
        </Label>
        {flag.description && (
          <p className="text-sm text-muted-foreground">{flag.description}</p>
        )}
        <p className="text-xs text-muted-foreground font-mono">{flag.key}</p>
        
        {flag.numeric_value !== null && (
          <div className="pt-2">
            <Input
              type="number"
              min="0"
              value={flag.numeric_value}
              onChange={(e) => handleNumericValueChange(flag.id, e.target.value)}
              className="w-32"
            />
          </div>
        )}
        
        {flag.text_value !== null && (flag.key === 'default_model_agent_a' || flag.key === 'default_model_agent_b' || flag.key === 'default_model_agent_c') && (
          <div className="pt-2">
            <CuratedModelSelector
              value={flag.text_value}
              onChange={(value) => handleTextValueChange(flag.id, value)}
            />
          </div>
        )}
        
        {flag.text_value !== null && (flag.key === 'default_profile_agent_a' || flag.key === 'default_profile_agent_b' || flag.key === 'default_profile_agent_c') && (
          <div className="pt-2">
            <ProfileSelector
              value={flag.text_value}
              onChange={(value) => handleTextValueChange(flag.id, value)}
            />
          </div>
        )}
        
        {flag.text_value !== null && !['default_model_agent_a', 'default_model_agent_b', 'default_model_agent_c', 'default_profile_agent_a', 'default_profile_agent_b', 'default_profile_agent_c'].includes(flag.key) && getSelectOptions(flag.key).length > 0 && (
          <div className="pt-2">
            <Select
              value={flag.text_value}
              onValueChange={(value) => handleTextValueChange(flag.id, value)}
            >
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getSelectOptions(flag.key).map((option) => (
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
        onCheckedChange={() => handleToggle(flag.id, flag.enabled)}
      />
    </div>
  );

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage feature flags and system settings</p>
        </div>
      </div>

      {flags.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-sm text-muted-foreground text-center">No feature flags configured</p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" defaultValue={["curated-models", "agent-defaults", "conversation-settings", "expert-settings", "feature-toggles"]} className="space-y-4">
          <AccordionItem value="curated-models" className="border rounded-lg px-6 bg-card">
            <AccordionTrigger className="hover:no-underline">
              <div>
                <h2 className="text-xl font-semibold">Curated Models</h2>
                <p className="text-sm text-muted-foreground">Manage which OpenRouter models are available to users</p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6">
              <CuratedModelsManager />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="agent-defaults" className="border rounded-lg px-6 bg-card">
            <AccordionTrigger className="hover:no-underline">
              <div>
                <h2 className="text-xl font-semibold">Agent Defaults</h2>
                <p className="text-sm text-muted-foreground">Configure default profiles and models for each agent</p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4 pb-6">
              {agentDefaultFlags.length > 0 ? (
                agentDefaultFlags.map(renderFlag)
              ) : (
                <p className="text-sm text-muted-foreground">No agent default settings configured</p>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="conversation-settings" className="border rounded-lg px-6 bg-card">
            <AccordionTrigger className="hover:no-underline">
              <div>
                <h2 className="text-xl font-semibold">Conversation Settings</h2>
                <p className="text-sm text-muted-foreground">Set default values for conversation parameters</p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4 pb-6">
              {conversationSettingsFlags.length > 0 ? (
                conversationSettingsFlags.map(renderFlag)
              ) : (
                <p className="text-sm text-muted-foreground">No conversation settings configured</p>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="expert-settings" className="border rounded-lg px-6 bg-card">
            <AccordionTrigger className="hover:no-underline">
              <div>
                <h2 className="text-xl font-semibold">Expert Settings</h2>
                <p className="text-sm text-muted-foreground">Configure advanced conversation behavior parameters</p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4 pb-6">
              {expertSettingsFlags.length > 0 ? (
                expertSettingsFlags.map(renderFlag)
              ) : (
                <p className="text-sm text-muted-foreground">No expert settings configured</p>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="feature-toggles" className="border rounded-lg px-6 bg-card">
            <AccordionTrigger className="hover:no-underline">
              <div>
                <h2 className="text-xl font-semibold">Feature Toggles</h2>
                <p className="text-sm text-muted-foreground">Enable or disable application features</p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4 pb-6">
              {featureToggleFlags.length > 0 ? (
                featureToggleFlags.map(renderFlag)
              ) : (
                <p className="text-sm text-muted-foreground">No feature toggles configured</p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
};
