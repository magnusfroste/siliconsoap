import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
const TEST_PROMPT = "Reply with exactly one word: OK";
const TIMEOUT_MS = 15000;
const DEGRADED_THRESHOLD_MS = 10000;

interface CheckResult {
  model_id: string;
  status: 'operational' | 'degraded' | 'down';
  response_time_ms: number | null;
  error_message: string | null;
  raw_response: string | null;
}

async function checkModel(modelId: string): Promise<CheckResult> {
  const startTime = Date.now();
  
  console.log(`[check-model-status] Testing model: ${modelId}`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://agentsmeetup.com',
        'X-Title': 'Agents Meetup Status Check',
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'user', content: TEST_PROMPT }
        ],
        max_tokens: 20, // Increased from 10 - OpenAI requires minimum 16
        // Removed temperature - some models don't support it
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[check-model-status] ❌ ${modelId} - HTTP ${response.status}: ${errorText}`);
      return {
        model_id: modelId,
        status: 'down',
        response_time_ms: responseTime,
        error_message: `HTTP ${response.status}: ${errorText.substring(0, 200)}`,
        raw_response: null,
      };
    }
    
    const data = await response.json();
    
    // Standard content location
    let content = data.choices?.[0]?.message?.content || '';
    
    // For "thinking" models, also check reasoning_content
    const reasoningContent = data.choices?.[0]?.message?.reasoning_content || '';
    
    // Check if we got usage (indicates model processed the request)
    const hasUsage = data.usage?.completion_tokens > 0;
    const finishReason = data.choices?.[0]?.finish_reason;
    
    // Log full response structure for debugging
    console.log(`[check-model-status] Response structure for ${modelId}:`, JSON.stringify({
      hasContent: !!content,
      contentLength: content?.length || 0,
      hasReasoning: !!reasoningContent,
      reasoningLength: reasoningContent?.length || 0,
      finishReason,
      completionTokens: data.usage?.completion_tokens || 0,
    }));
    
    // If content is empty, try to use reasoning content
    if (!content && reasoningContent) {
      content = reasoningContent;
    }
    
    console.log(`[check-model-status] Response from ${modelId}: "${content}" (${responseTime}ms)`);
    
    // Check if response is valid - more lenient for thinking models
    const isValidResponse = content.toLowerCase().includes('ok') || 
                            reasoningContent.toLowerCase().includes('ok');
    
    // If we got usage tokens, model is working even if response format is unexpected
    if (!isValidResponse && hasUsage) {
      console.log(`[check-model-status] ℹ️ ${modelId} - Got response with usage (${data.usage?.completion_tokens} tokens) but unexpected format`);
      return {
        model_id: modelId,
        status: 'operational', // Model is working, just different response format
        response_time_ms: responseTime,
        error_message: null,
        raw_response: content || reasoningContent || '[thinking model]',
      };
    }
    
    if (!isValidResponse) {
      console.warn(`[check-model-status] ⚠️ ${modelId} - Unexpected response: "${content}"`);
      return {
        model_id: modelId,
        status: 'degraded',
        response_time_ms: responseTime,
        error_message: `Unexpected response format`,
        raw_response: content.substring(0, 100),
      };
    }
    
    // Check response time
    if (responseTime > DEGRADED_THRESHOLD_MS) {
      console.warn(`[check-model-status] ⚠️ ${modelId} - Slow response: ${responseTime}ms`);
      return {
        model_id: modelId,
        status: 'degraded',
        response_time_ms: responseTime,
        error_message: `Slow response (>${DEGRADED_THRESHOLD_MS}ms)`,
        raw_response: content.substring(0, 100),
      };
    }
    
    console.log(`[check-model-status] ✅ ${modelId} - OK (${responseTime}ms)`);
    return {
      model_id: modelId,
      status: 'operational',
      response_time_ms: responseTime,
      error_message: null,
      raw_response: content.substring(0, 100),
    };
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`[check-model-status] ❌ ${modelId} - Timeout after ${TIMEOUT_MS}ms`);
      return {
        model_id: modelId,
        status: 'down',
        response_time_ms: responseTime,
        error_message: `Timeout after ${TIMEOUT_MS}ms`,
        raw_response: null,
      };
    }
    
    console.error(`[check-model-status] ❌ ${modelId} - Error: ${errorMessage}`);
    return {
      model_id: modelId,
      status: 'down',
      response_time_ms: responseTime,
      error_message: errorMessage.substring(0, 200),
      raw_response: null,
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    const { model_id } = await req.json();
    
    if (!model_id) {
      return new Response(
        JSON.stringify({ error: 'model_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[check-model-status] Starting health check for: ${model_id}`);
    
    const result = await checkModel(model_id);
    
    console.log(`[check-model-status] Result for ${model_id}:`, JSON.stringify(result));

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[check-model-status] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
