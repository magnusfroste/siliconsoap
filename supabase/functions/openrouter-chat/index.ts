import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-api-key',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the raw body text first for debugging
    const bodyText = await req.text();
    console.log('Received body:', bodyText);
    
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (parseError) {
      console.error('Failed to parse body as JSON:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
          code: 'INVALID_JSON',
          receivedBody: bodyText.substring(0, 100) // Log first 100 chars
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
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

    const response = await fetch('https://api.openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': req.headers.get('referer') || 'https://lovable.dev',
        'X-Title': 'Magnus Froste Labs'
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens,
        temperature,
        top_p,
        stream: false
      }),
    });

    const data = await response.json();

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
