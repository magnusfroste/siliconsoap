// Model domain types - CuratedModel and related types

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
  default_for_agent: string | null;
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
  default_for_agent?: string | null;
}
