// Feature Flags Repository - handles all feature flags data access
import { supabase } from '@/integrations/supabase/client';

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  numeric_value?: number;
  text_value?: string;
}

export const featureFlagsRepository = {
  // Get all feature flags
  async getAllFlags(): Promise<FeatureFlag[]> {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error loading feature flags:', error);
      return [];
    }

    return (data || []).map(flag => ({
      id: flag.id,
      key: flag.key,
      name: flag.name,
      description: flag.description || undefined,
      enabled: flag.enabled || false,
      numeric_value: flag.numeric_value || undefined,
      text_value: flag.text_value || undefined
    }));
  },

  // Get a specific flag by key
  async getFlagByKey(key: string): Promise<FeatureFlag | null> {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .eq('key', key)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      key: data.key,
      name: data.name,
      description: data.description || undefined,
      enabled: data.enabled || false,
      numeric_value: data.numeric_value || undefined,
      text_value: data.text_value || undefined
    };
  },

  // Check if a flag is enabled
  async isEnabled(key: string): Promise<boolean> {
    const flag = await this.getFlagByKey(key);
    return flag?.enabled || false;
  },

  // Update a feature flag
  async updateFlag(id: string, updates: Partial<FeatureFlag>): Promise<boolean> {
    const { error } = await supabase
      .from('feature_flags')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating feature flag:', error);
      return false;
    }

    return true;
  },

  // Create a new feature flag
  async createFlag(flag: Omit<FeatureFlag, 'id'>): Promise<FeatureFlag | null> {
    const { data, error } = await supabase
      .from('feature_flags')
      .insert(flag)
      .select()
      .single();

    if (error) {
      console.error('Error creating feature flag:', error);
      return null;
    }

    return data;
  },

  // Delete a feature flag
  async deleteFlag(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('feature_flags')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting feature flag:', error);
      return false;
    }

    return true;
  }
};
