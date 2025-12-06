import { useState, useEffect, useCallback, useRef } from 'react';
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

// Module-level cache to prevent redundant fetches across hook instances
let flagsCache: FeatureFlag[] | null = null;
let fetchPromise: Promise<FeatureFlag[]> | null = null;

export const useFeatureFlags = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>(flagsCache || []);
  const [loading, setLoading] = useState(flagsCache === null);
  const isMounted = useRef(true);

  const fetchFlags = useCallback(async (): Promise<FeatureFlag[]> => {
    // If already fetching, return the existing promise
    if (fetchPromise) {
      return fetchPromise;
    }

    fetchPromise = (async () => {
      try {
        const { data, error } = await supabase
          .from('feature_flags')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;
        const newFlags = data || [];
        flagsCache = newFlags;
        return newFlags;
      } catch (error) {
        console.error('Error fetching feature flags:', error);
        return flagsCache || [];
      } finally {
        fetchPromise = null;
      }
    })();

    return fetchPromise;
  }, []);

  useEffect(() => {
    isMounted.current = true;
    
    const loadFlags = async () => {
      // Use cache if available
      if (flagsCache) {
        setFlags(flagsCache);
        setLoading(false);
        return;
      }

      const newFlags = await fetchFlags();
      if (isMounted.current) {
        setFlags(newFlags);
        setLoading(false);
      }
    };

    loadFlags();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('feature-flags-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feature_flags'
        },
        async () => {
          // Invalidate cache and refetch
          flagsCache = null;
          const newFlags = await fetchFlags();
          if (isMounted.current) {
            setFlags(newFlags);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted.current = false;
      supabase.removeChannel(channel);
    };
  }, [fetchFlags]);

  const isEnabled = useCallback((key: string): boolean => {
    const flag = flags.find(f => f.key === key);
    return flag?.enabled ?? false;
  }, [flags]);

  const getNumericValue = useCallback((key: string): number | null => {
    const flag = flags.find(f => f.key === key);
    return flag?.numeric_value ?? null;
  }, [flags]);

  const getTextValue = useCallback((key: string): string | null => {
    const flag = flags.find(f => f.key === key);
    return flag?.text_value ?? null;
  }, [flags]);

  const refetch = useCallback(async () => {
    flagsCache = null;
    const newFlags = await fetchFlags();
    if (isMounted.current) {
      setFlags(newFlags);
    }
  }, [fetchFlags]);

  return { flags, isEnabled, getNumericValue, getTextValue, loading, refetch };
};
