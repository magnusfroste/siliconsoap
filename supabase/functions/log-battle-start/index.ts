import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[LOG-BATTLE-START] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analyticsId, sessionId } = await req.json();
    
    if (!analyticsId && !sessionId) {
      return new Response(
        JSON.stringify({ error: 'analyticsId or sessionId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract IP address from various headers
    const clientIp = 
      req.headers.get('cf-connecting-ip') || // Cloudflare
      req.headers.get('x-real-ip') || // Nginx proxy
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || // Standard proxy header
      req.headers.get('x-client-ip') ||
      'unknown';

    logStep('Extracted IP', { clientIp });

    // Get country code from Cloudflare header (if available)
    let countryCode = req.headers.get('cf-ipcountry') || null;

    // If no Cloudflare country, try a free geo-IP service
    if (!countryCode && clientIp !== 'unknown') {
      try {
        const geoResponse = await fetch(`https://ipapi.co/${clientIp}/country/`, {
          headers: { 'User-Agent': 'SiliconMinds/1.0' }
        });
        if (geoResponse.ok) {
          countryCode = await geoResponse.text();
          if (countryCode.length > 2) {
            countryCode = null; // Invalid response
          }
        }
      } catch (geoError) {
        logStep('Geo lookup failed (non-critical)', { error: String(geoError) });
      }
    }

    logStep('Country resolved', { countryCode });

    // Initialize Supabase client with service role for update
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update the analytics record
    let updateResult;
    
    if (analyticsId) {
      updateResult = await supabase
        .from('chat_analytics')
        .update({
          ip_address: clientIp,
          country_code: countryCode
        })
        .eq('id', analyticsId);
    } else if (sessionId) {
      // For guests, find by session_id (most recent)
      updateResult = await supabase
        .from('chat_analytics')
        .update({
          ip_address: clientIp,
          country_code: countryCode
        })
        .eq('session_id', sessionId)
        .is('ip_address', null)
        .order('created_at', { ascending: false })
        .limit(1);
    }

    if (updateResult?.error) {
      logStep('Update failed', { error: updateResult.error });
      throw updateResult.error;
    }

    logStep('Analytics updated successfully', { analyticsId, sessionId, clientIp, countryCode });

    return new Response(
      JSON.stringify({ 
        success: true, 
        ip: clientIp, 
        country: countryCode 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logStep('Error', { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
