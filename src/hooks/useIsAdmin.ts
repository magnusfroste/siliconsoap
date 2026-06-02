import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const QUERY_KEY = ['is-admin'];

export const useIsAdmin = () => {
  const queryClient = useQueryClient();

  const { data: isAdmin = false, isLoading: loading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      return !!data;
    },
    staleTime: 5 * 60_000,
  });

  // Re-check on auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    });
    return () => subscription.unsubscribe();
  }, [queryClient]);

  return { isAdmin, loading };
};
