import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { profiles as fallbackProfiles } from '@/pages/labs/projects/agents-meetup/constants';
import { getIconComponent } from '@/utils/iconMap';
import { Profile } from '@/components/labs/agent-card/types';

export const useAgentProfiles = () => {
  const { data: dbProfiles, isLoading, error } = useQuery({
    queryKey: ['agent-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Transform database profiles to Profile type
  const profiles: Profile[] = dbProfiles?.map(profile => ({
    id: profile.slug,
    name: profile.name,
    description: profile.description,
    icon: getIconComponent(profile.icon_name),
    instructions: profile.instructions,
  })) || fallbackProfiles;

  return {
    profiles,
    isLoading,
    error,
  };
};
