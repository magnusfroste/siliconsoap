import { supabase } from "@/integrations/supabase/client";

export interface LicenseDetectionResult {
  model_id: string;
  license_type: 'open-weight' | 'closed';
  provider_detection: 'open-weight' | 'closed' | 'unknown';
  huggingface: {
    exists: boolean;
    huggingface_url: string | null;
    license: string | null;
    downloads: number | null;
  };
}

export async function detectModelLicense(
  modelId: string, 
  provider: string
): Promise<LicenseDetectionResult> {
  const { data, error } = await supabase.functions.invoke('check-huggingface', {
    body: { model_id: modelId, provider }
  });

  if (error) {
    console.error('Error detecting license:', error);
    throw error;
  }

  return data as LicenseDetectionResult;
}

export async function detectMultipleModelLicenses(
  models: Array<{ model_id: string; provider: string }>
): Promise<Map<string, LicenseDetectionResult>> {
  const results = new Map<string, LicenseDetectionResult>();
  
  // Process in batches of 3 to avoid rate limiting
  const batchSize = 3;
  for (let i = 0; i < models.length; i += batchSize) {
    const batch = models.slice(i, i + batchSize);
    const promises = batch.map(m => 
      detectModelLicense(m.model_id, m.provider)
        .then(result => ({ modelId: m.model_id, result }))
        .catch(error => {
          console.error(`Failed to detect license for ${m.model_id}:`, error);
          return null;
        })
    );
    
    const batchResults = await Promise.all(promises);
    for (const res of batchResults) {
      if (res) {
        results.set(res.modelId, res.result);
      }
    }
    
    // Small delay between batches
    if (i + batchSize < models.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return results;
}
