import { supabase } from '@/integrations/supabase/client';

export interface ModelInfoParams {
  model_id: string;
  display_name: string;
  provider: string;
}

export interface ModelInfoResult {
  description: string;
  pros: string[];
  cons: string[];
  use_cases: string[];
  avoid_cases: string[];
  category: string;
  speed_rating: string;
  context_window: string;
}

export const modelInfoService = {
  async generateModelInfo(params: ModelInfoParams): Promise<ModelInfoResult> {
    const { data, error } = await supabase.functions.invoke('generate-model-info', {
      body: params,
    });

    if (error) throw error;
    return data as ModelInfoResult;
  }
};
