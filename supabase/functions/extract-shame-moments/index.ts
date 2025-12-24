import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analysis, chatId, shareId } = await req.json();
    
    if (!analysis || typeof analysis !== 'string') {
      console.log('No analysis provided');
      return new Response(JSON.stringify({ success: false, message: 'No analysis provided' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Extracting shame moments from analysis...');
    console.log('Analysis length:', analysis.length);
    console.log('ChatId:', chatId, 'ShareId:', shareId);

    // Use Lovable AI to extract shame moments
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const extractionPrompt = `
    Du är en expert på att hitta dramatiska ögonblick i AI-konversationer.
    
    Analysera följande Judge Bot-analys och extrahera de BÄSTA citaten/momenten.
    Returnera EXAKT 1-3 moments i JSON-format.
    
    Varje moment ska ha:
    - agent_name: Namnet på agenten (t.ex. "Agent A", "GPT-4", etc.)
    - quote: Det dramatiska citatet eller beskrivningen (max 150 tecken)
    - shame_type: En av: "backstab" (underminerade någon), "diva" (tog över scenen), "trust_issue" (sa en sak, menade annan)
    - severity: 1-5 hur dramatiskt (5 = maximalt drama)
    
    Här är analysen:
    ${analysis.substring(0, 3000)}
    
    Returnera ENDAST valid JSON-array, ingen annan text:
    [{"agent_name": "...", "quote": "...", "shame_type": "...", "severity": 3}]
    `;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: extractionPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content;
    
    console.log('AI extraction result:', content);

    if (!content) {
      console.log('No content from AI');
      return new Response(JSON.stringify({ success: false, message: 'No extraction result' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse the JSON from AI response
    let moments = [];
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        moments = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      return new Response(JSON.stringify({ success: false, message: 'Failed to parse moments' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!Array.isArray(moments) || moments.length === 0) {
      console.log('No moments extracted');
      return new Response(JSON.stringify({ success: true, inserted: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client with service role for insert
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert shame moments into the database
    const validMoments = moments.slice(0, 3).map((m: any) => ({
      chat_id: chatId || null,
      share_id: shareId || null,
      agent_name: String(m.agent_name || 'Unknown Agent').substring(0, 100),
      quote: String(m.quote || '').substring(0, 300),
      shame_type: ['backstab', 'diva', 'trust_issue'].includes(m.shame_type) ? m.shame_type : 'backstab',
      severity: Math.min(5, Math.max(1, Number(m.severity) || 3)),
    }));

    console.log('Inserting moments:', validMoments);

    const { data, error } = await supabase
      .from('hall_of_shame')
      .insert(validMoments)
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    console.log('Successfully inserted shame moments:', data?.length);

    return new Response(JSON.stringify({ success: true, inserted: data?.length || 0 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in extract-shame-moments:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
