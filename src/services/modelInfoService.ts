import { supabase } from '@/integrations/supabase/client';

export interface ModelInfoParams {
  model_id: string;
  display_name: string;
  provider: string;
  supports_reasoning?: boolean;
}

/** Draft factual description only; admins review it before publishing. */
export interface ModelInfoResult {
  description: string;
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
