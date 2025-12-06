import { supabase } from "@/integrations/supabase/client";

export interface CuratedModel {
  id: string;
  model_id: string;
  display_name: string;
  provider: string;
  is_enabled: boolean;
  is_free: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Educational content fields
  description: string | null;
  pros: string[] | null;
  cons: string[] | null;
  use_cases: string[] | null;
  avoid_cases: string[] | null;
  category: string | null;
  context_window: number | null;
  speed_rating: string | null;
}

export interface CuratedModelInsert {
  model_id: string;
  display_name: string;
  provider: string;
  is_enabled?: boolean;
  is_free?: boolean;
  sort_order?: number;
  // Educational content fields
  description?: string | null;
  pros?: string[] | null;
  cons?: string[] | null;
  use_cases?: string[] | null;
  avoid_cases?: string[] | null;
  category?: string | null;
  context_window?: number | null;
  speed_rating?: string | null;
}

export interface CuratedModelUpdate {
  description?: string | null;
  pros?: string[] | null;
  cons?: string[] | null;
  use_cases?: string[] | null;
  avoid_cases?: string[] | null;
  category?: string | null;
  context_window?: number | null;
  speed_rating?: string | null;
  is_enabled?: boolean;
  is_free?: boolean;
  display_name?: string;
}

// Update model educational content
export const updateModelContent = async (id: string, updates: CuratedModelUpdate): Promise<void> => {
  const { error } = await supabase
    .from('curated_models')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating model content:', error);
    throw error;
  }
};

// Get all curated models (for admin view)
export const getAllCuratedModels = async (): Promise<CuratedModel[]> => {
  const { data, error } = await supabase
    .from('curated_models')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching curated models:', error);
    throw error;
  }

  return data || [];
};

// Get only enabled models (for user-facing selectors)
export const getEnabledModels = async (): Promise<CuratedModel[]> => {
  const { data, error } = await supabase
    .from('curated_models')
    .select('*')
    .eq('is_enabled', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching enabled models:', error);
    throw error;
  }

  return data || [];
};

// Toggle model enabled status
export const toggleModelEnabled = async (id: string, isEnabled: boolean): Promise<void> => {
  const { error } = await supabase
    .from('curated_models')
    .update({ is_enabled: isEnabled })
    .eq('id', id);

  if (error) {
    console.error('Error toggling model:', error);
    throw error;
  }
};

// Add a new model to curated list
export const addCuratedModel = async (model: CuratedModelInsert): Promise<CuratedModel> => {
  const { data, error } = await supabase
    .from('curated_models')
    .insert(model)
    .select()
    .single();

  if (error) {
    console.error('Error adding curated model:', error);
    throw error;
  }

  return data;
};

// Remove a model from curated list
export const removeCuratedModel = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('curated_models')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error removing curated model:', error);
    throw error;
  }
};

// Bulk add models from OpenRouter
export const bulkAddModels = async (models: CuratedModelInsert[]): Promise<void> => {
  const { error } = await supabase
    .from('curated_models')
    .upsert(models, { onConflict: 'model_id' });

  if (error) {
    console.error('Error bulk adding models:', error);
    throw error;
  }
};

// Update model sort order
export const updateModelSortOrder = async (id: string, sortOrder: number): Promise<void> => {
  const { error } = await supabase
    .from('curated_models')
    .update({ sort_order: sortOrder })
    .eq('id', id);

  if (error) {
    console.error('Error updating sort order:', error);
    throw error;
  }
};
