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
import { toast } from 'sonner';
import { Shield } from 'lucide-react';

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

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage feature flags and system settings</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
          <CardDescription>
            Control which features are enabled or disabled across the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {flags.length === 0 ? (
            <p className="text-sm text-muted-foreground">No feature flags configured</p>
          ) : (
            flags.map((flag) => (
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
                  
                  {flag.text_value !== null && getSelectOptions(flag.key).length > 0 && (
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
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
