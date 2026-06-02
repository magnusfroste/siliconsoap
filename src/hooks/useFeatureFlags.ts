import { useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string | null;
  enabled: boolean;
  numeric_value: number | null;
  text_value: string | null;
  created_at: string;
  updated_at: string;
}

const QUERY_KEY = ['feature-flags'];

export const useFeatureFlags = () => {
  const queryClient = useQueryClient();

  const { data: flags = [], isLoading: loading, refetch: rqRefetch } = useQuery<FeatureFlag[]>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    staleTime: 60_000,
  });

  // Realtime invalidation
  useEffect(() => {
    const channel = supabase
      .channel('feature-flags-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'feature_flags' },
        () => queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const isEnabled = useCallback(
    (key: string): boolean => flags.find(f => f.key === key)?.enabled ?? false,
    [flags]
  );

  const getNumericValue = useCallback(
    (key: string): number | null => flags.find(f => f.key === key)?.numeric_value ?? null,
    [flags]
  );

  const getTextValue = useCallback(
    (key: string): string | null => flags.find(f => f.key === key)?.text_value ?? null,
    [flags]
  );

  const refetch = useCallback(async () => {
    await rqRefetch();
  }, [rqRefetch]);

  return { flags, isEnabled, getNumericValue, getTextValue, loading, refetch };
};
