import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { toast } from 'sonner';

export const useAdminFlags = () => {
  const { flags, loading, refetch } = useFeatureFlags();

  const handleToggle = useCallback(async (flagId: string, currentEnabled: boolean) => {
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
  }, [refetch]);

  const handleNumericChange = useCallback(async (flagId: string, value: string) => {
    const numericValue = parseInt(value, 10);
    if (isNaN(numericValue) || numericValue < 0) return;

    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ numeric_value: numericValue })
        .eq('id', flagId);

      if (error) throw error;

      toast.success('Value updated');
      refetch();
    } catch (error) {
      console.error('Error updating numeric value:', error);
      toast.error('Failed to update value');
    }
  }, [refetch]);

  const handleTextChange = useCallback(async (flagId: string, value: string) => {
    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ text_value: value })
        .eq('id', flagId);

      if (error) throw error;

      toast.success('Value updated');
      refetch();
    } catch (error) {
      console.error('Error updating text value:', error);
      toast.error('Failed to update value');
    }
  }, [refetch]);

  // Categorize flags
  // Note: Model defaults (default_model_agent_*) are now set via the Models tab, not feature flags
  const agentDefaultFlags = flags.filter(f => 
    f.key.startsWith('default_profile_agent_')
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

  return {
    flags,
    loading,
    agentDefaultFlags,
    conversationSettingsFlags,
    expertSettingsFlags,
    featureToggleFlags,
    handleToggle,
    handleNumericChange,
    handleTextChange
  };
};
