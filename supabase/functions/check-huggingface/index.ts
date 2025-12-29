import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Known closed-source providers (cloud API only)
const CLOSED_PROVIDERS = ['openai', 'anthropic', 'google', 'x-ai', 'xai'];

// Known open-weight providers
const OPEN_PROVIDERS = ['meta-llama', 'deepseek', 'qwen', 'mistralai', 'microsoft', 'alibaba', 'nvidia'];

// Model ID mappings from OpenRouter to Hugging Face
const MODEL_ID_MAPPINGS: Record<string, string> = {
  'meta-llama/llama-3.3-70b-instruct': 'meta-llama/Llama-3.3-70B-Instruct',
  'meta-llama/llama-3.1-8b-instruct': 'meta-llama/Llama-3.1-8B-Instruct',
  'meta-llama/llama-3.1-70b-instruct': 'meta-llama/Llama-3.1-70B-Instruct',
  'meta-llama/llama-3.1-405b-instruct': 'meta-llama/Llama-3.1-405B-Instruct',
  'deepseek/deepseek-chat': 'deepseek-ai/DeepSeek-V3',
  'deepseek/deepseek-r1': 'deepseek-ai/DeepSeek-R1',
  'qwen/qwen-2.5-72b-instruct': 'Qwen/Qwen2.5-72B-Instruct',
  'qwen/qwq-32b': 'Qwen/QwQ-32B',
  'mistralai/mistral-large': 'mistralai/Mistral-Large-Instruct-2407',
  'mistralai/mistral-small': 'mistralai/Mistral-Small-24B-Instruct-2501',
  'nvidia/llama-3.1-nemotron-70b-instruct': 'nvidia/Llama-3.1-Nemotron-70B-Instruct-HF',
};

function detectLicenseByProvider(modelId: string, provider: string): 'open-weight' | 'closed' | 'unknown' {
  const providerLower = provider.toLowerCase();
  const modelIdLower = modelId.toLowerCase();
  
  // Check closed providers first
  if (CLOSED_PROVIDERS.some(p => providerLower.includes(p))) {
    return 'closed';
  }
  
  // Check open-weight providers
  if (OPEN_PROVIDERS.some(p => modelIdLower.includes(p) || providerLower.includes(p))) {
    return 'open-weight';
  }
  
  return 'unknown';
}

function getHuggingFaceModelId(openRouterModelId: string): string {
  // Check direct mapping first
  if (MODEL_ID_MAPPINGS[openRouterModelId]) {
    return MODEL_ID_MAPPINGS[openRouterModelId];
  }
  
  // Try to construct HF model ID from OpenRouter ID
  // OpenRouter format: provider/model-name
  // HuggingFace format: org/Model-Name (often with different casing)
  const parts = openRouterModelId.split('/');
  if (parts.length === 2) {
    return openRouterModelId; // Try as-is first
  }
  
  return openRouterModelId;
}

async function checkHuggingFace(modelId: string): Promise<{
  exists: boolean;
  huggingface_url: string | null;
  license: string | null;
  downloads: number | null;
}> {
  const hfModelId = getHuggingFaceModelId(modelId);
  
  try {
    // Try the mapped/direct model ID
    const response = await fetch(`https://huggingface.co/api/models/${hfModelId}`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        exists: true,
        huggingface_url: `https://huggingface.co/${data.id || hfModelId}`,
        license: data.license || null,
        downloads: data.downloads || null,
      };
    }
    
    // If direct lookup fails, try search
    const searchResponse = await fetch(
      `https://huggingface.co/api/models?search=${encodeURIComponent(modelId.split('/').pop() || modelId)}&limit=1`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      if (searchData.length > 0 && searchData[0].id) {
        return {
          exists: true,
          huggingface_url: `https://huggingface.co/${searchData[0].id}`,
          license: searchData[0].license || null,
          downloads: searchData[0].downloads || null,
        };
      }
    }
    
    return {
      exists: false,
      huggingface_url: null,
      license: null,
      downloads: null,
    };
  } catch (error) {
    console.error('Error checking HuggingFace:', error);
    return {
      exists: false,
      huggingface_url: null,
      license: null,
      downloads: null,
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { model_id, provider } = await req.json();
    
    if (!model_id) {
      return new Response(
        JSON.stringify({ error: 'model_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Checking model: ${model_id} (provider: ${provider})`);

    // Step 1: Check by provider first (fast)
    const providerResult = detectLicenseByProvider(model_id, provider || '');
    
    // Step 2: If unknown or open-weight, verify with HuggingFace
    let huggingFaceResult = {
      exists: false,
      huggingface_url: null as string | null,
      license: null as string | null,
      downloads: null as number | null,
    };
    
    if (providerResult !== 'closed') {
      huggingFaceResult = await checkHuggingFace(model_id);
    }

    // Determine final license type
    let license_type: 'open-weight' | 'closed';
    if (providerResult === 'closed') {
      license_type = 'closed';
    } else if (huggingFaceResult.exists || providerResult === 'open-weight') {
      license_type = 'open-weight';
    } else {
      // Default to closed if we can't verify it's open
      license_type = 'closed';
    }

    const result = {
      model_id,
      license_type,
      provider_detection: providerResult,
      huggingface: huggingFaceResult,
    };

    console.log(`Result for ${model_id}:`, result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in check-huggingface function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
