import { supabase } from "@/integrations/supabase/client";
import { CuratedModel, CuratedModelInsert, CuratedModelUpdate } from "@/models";

// Re-export types for backward compatibility
export type { CuratedModel, CuratedModelInsert, CuratedModelUpdate } from "@/models";

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

// Disable a model (convenience function)
export const disableModel = async (id: string): Promise<void> => {
  return toggleModelEnabled(id, false);
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
