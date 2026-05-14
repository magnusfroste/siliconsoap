import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-api-key',
};

const openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';

const extractMessageContent = (payload: any): string => {
  const rawContent = payload?.choices?.[0]?.message?.content;

  if (typeof rawContent === 'string') {
    return rawContent.trim();
  }

  if (Array.isArray(rawContent)) {
    return rawContent
      .map((part: any) => {
        if (typeof part === 'string') return part;
        if (typeof part?.text === 'string') return part.text;
        return '';
      })
      .join('')
      .trim();
  }

  return '';
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log the raw request details
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    // Clone the request so we can read the body multiple times if needed
    const reqClone = req.clone();
    
    // Try to get the body
    let body;
    try {
      body = await req.json();
      console.log('Successfully parsed body:', JSON.stringify(body));
    } catch (jsonError) {
      console.error('Failed to parse JSON:', jsonError);
      // Try to read as text to see what we got
      try {
        const textBody = await reqClone.text();
        console.error('Body as text:', textBody.substring(0, 500)); // First 500 chars
      } catch (textError) {
        console.error('Failed to read as text too:', textError);
      }
      throw new Error(`Invalid JSON: ${jsonError instanceof Error ? jsonError.message : 'Unknown error'}`);
    }
    
    const { model, messages, max_tokens, temperature, top_p } = body;
    
    // Check if user provided their own API key
    const userApiKey = req.headers.get('x-user-api-key');
    
    // Use user's key if provided, otherwise fall back to shared key
    const apiKey = userApiKey || Deno.env.get('OPENROUTER_API_KEY');
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'No API key available. Please provide your own OpenRouter API key.' 
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Making OpenRouter request with model: ${model}`);
    console.log(`Using ${userApiKey ? 'user' : 'shared'} API key`);

    const requestBody = {
      model,
      messages,
      max_tokens,
      temperature,
      top_p,
      stream: false,
      usage: { include: true }
    };

    const requestHeaders = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': req.headers.get('referer') || 'https://lovable.dev',
      'X-Title': 'Magnus Froste Labs'
    };

    const response = await fetch(openRouterUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    
    // Log usage data for debugging
    console.log(`OpenRouter response - model: ${data.model}, has usage: ${!!data.usage}, usage: ${JSON.stringify(data.usage)}`);

    // Handle rate limit errors
    if (!response.ok) {
      console.error('OpenRouter API error:', response.status, data);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded',
            code: 'RATE_LIMIT',
            message: userApiKey 
              ? 'Your API key has hit rate limits. Please try again later.' 
              : 'Shared API key rate limit reached. Please add your own API key to continue.',
            shouldPromptBYOK: !userApiKey
          }),
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: data.error?.message || 'Failed to get response from AI model.',
          code: 'API_ERROR'
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check for empty content (silent rate limiting or model issues)
    const content = extractMessageContent(data);
    if (!content || content.trim() === '') {
      console.warn(`Empty response from model ${model}, possibly rate limited`);
      const reasoningTokens = data.usage?.completion_tokens_details?.reasoning_tokens ?? 0;

      const boostedMaxTokens = Math.max((max_tokens ?? 200) * 6, 1500);
      console.log(`Model ${model} returned empty response (reasoning_tokens=${reasoningTokens}). Retrying with max_tokens=${boostedMaxTokens}`);

      const retryResponse = await fetch(openRouterUrl, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify({
          ...requestBody,
          max_tokens: boostedMaxTokens,
        }),
      });
      const retryData = await retryResponse.json();
      const retryContent = extractMessageContent(retryData);

      if (retryResponse.ok && retryContent) {
        console.log('Retry successful.');
        return new Response(JSON.stringify(retryData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.error('Retry failed. Falling back to Mixtral.', {
        status: retryResponse.status,
        error: retryData?.error,
      });

      const fallbackModel = 'mistralai/mixtral-8x7b-instruct-v0.1';
      if (model !== fallbackModel) {
        console.log(`Retrying with fallback model: ${fallbackModel}`);
        
        const fallbackResponse = await fetch(openRouterUrl, {
          method: 'POST',
          headers: requestHeaders,
          body: JSON.stringify({
            ...requestBody,
            model: fallbackModel,
          }),
        });

        const fallbackData = await fallbackResponse.json();
        const fallbackContent = extractMessageContent(fallbackData);
        console.log(`Fallback response - status: ${fallbackResponse.status}, has usage: ${!!fallbackData.usage}, usage: ${JSON.stringify(fallbackData.usage)}, error: ${JSON.stringify(fallbackData?.error)}`);
        
        if (fallbackResponse.ok && fallbackContent) {
          console.log('Fallback model succeeded');
          // Mark that we used a fallback
          fallbackData.fallback_used = true;
          fallbackData.original_model = model;
          return new Response(JSON.stringify(fallbackData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
      
      // Return error if no content and fallback failed
      return new Response(
        JSON.stringify({ 
          error: 'Model returned empty response. It may be rate limited or unavailable.',
          code: 'EMPTY_RESPONSE',
          model: model
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in openrouter-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
