import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Price tier thresholds based on price per 1M output tokens
const TIER_THRESHOLDS = {
  free: 0,
  budget: 0.5,      // < $0.50 per 1M tokens
  standard: 3.0,    // $0.50 - $3.00 per 1M tokens
  premium: 15.0,    // $3.00 - $15.00 per 1M tokens
  // elite: > $15.00 per 1M tokens
};

function calculatePriceTier(priceInput: number, priceOutput: number): string {
  // If both are 0, it's free
  if (priceInput === 0 && priceOutput === 0) {
    return 'free';
  }
  
  // Calculate price per 1M output tokens (primary metric)
  const pricePerMillion = priceOutput * 1_000_000;
  
  if (pricePerMillion < TIER_THRESHOLDS.budget) {
    return 'budget';
  } else if (pricePerMillion < TIER_THRESHOLDS.standard) {
    return 'standard';
  } else if (pricePerMillion < TIER_THRESHOLDS.premium) {
    return 'premium';
  } else {
    return 'elite';
  }
}

interface OpenRouterModel {
  id: string;
  pricing?: {
    prompt?: string;
    completion?: string;
    request?: string;
    image?: string;
  };
  context_length?: number;
}

interface OpenRouterResponse {
  data: OpenRouterModel[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    console.log('Fetching models from OpenRouter...');

    // Fetch all models from OpenRouter
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'HTTP-Referer': 'https://siliconsoap.com',
        'X-Title': 'SiliconSoap',
      },
    });

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      console.error('OpenRouter API error:', openRouterResponse.status, errorText);
      throw new Error(`OpenRouter API error: ${openRouterResponse.status}`);
    }

    const openRouterData: OpenRouterResponse = await openRouterResponse.json();
    console.log(`Fetched ${openRouterData.data?.length || 0} models from OpenRouter`);

    // Create a map of model_id -> pricing for quick lookup
    const pricingMap = new Map<string, { priceInput: number; priceOutput: number }>();
    for (const model of openRouterData.data || []) {
      const priceInput = parseFloat(model.pricing?.prompt || '0') || 0;
      const priceOutput = parseFloat(model.pricing?.completion || '0') || 0;
      pricingMap.set(model.id, { priceInput, priceOutput });
    }

    // Fetch all curated models from our database
    const { data: curatedModels, error: fetchError } = await supabase
      .from('curated_models')
      .select('id, model_id, display_name');

    if (fetchError) {
      console.error('Error fetching curated models:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${curatedModels?.length || 0} curated models to update`);

    let updatedCount = 0;
    let notFoundCount = 0;
    const notFoundModels: string[] = [];

    // Update each curated model with pricing info
    for (const model of curatedModels || []) {
      const pricing = pricingMap.get(model.model_id);
      
      if (pricing) {
        const priceTier = calculatePriceTier(pricing.priceInput, pricing.priceOutput);
        
        const { error: updateError } = await supabase
          .from('curated_models')
          .update({
            price_input: pricing.priceInput,
            price_output: pricing.priceOutput,
            price_tier: priceTier,
            pricing_updated_at: new Date().toISOString(),
          })
          .eq('id', model.id);

        if (updateError) {
          console.error(`Error updating model ${model.model_id}:`, updateError);
        } else {
          console.log(`Updated ${model.display_name}: tier=${priceTier}, input=$${pricing.priceInput}/token, output=$${pricing.priceOutput}/token`);
          updatedCount++;
        }
      } else {
        notFoundCount++;
        notFoundModels.push(model.model_id);
        console.warn(`Model not found in OpenRouter: ${model.model_id}`);
      }
    }

    const summary = {
      success: true,
      totalModels: curatedModels?.length || 0,
      updated: updatedCount,
      notFound: notFoundCount,
      notFoundModels: notFoundModels.slice(0, 10), // Limit to first 10 for brevity
      syncedAt: new Date().toISOString(),
    };

    console.log('Sync complete:', summary);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in sync-model-pricing:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
