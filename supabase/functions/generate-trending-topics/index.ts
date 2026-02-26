import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You generate trending debate topics categorized by type. Return ONLY a JSON object with these exact keys: "general-problem", "ethical-dilemma", "future-prediction". Each key maps to an array of 3 short debate questions (under 80 chars). Topics should be based on current real-world events and trends. No markdown, no explanation, just the JSON object.

Example format:
{"general-problem":["topic1","topic2","topic3"],"ethical-dilemma":["topic1","topic2","topic3"],"future-prediction":["topic1","topic2","topic3"]}`
          },
          {
            role: 'user',
            content: `Generate 9 trending debate topics (3 per category) that are hot right now in February 2026:
- general-problem: Real policy/societal problems being debated (e.g. regulation, economy, housing)
- ethical-dilemma: Moral questions around tech, AI, bioethics, privacy
- future-prediction: Bold predictions about AI, space, biotech, society
Return only the JSON object.`
          }
        ],
        max_tokens: 1000,
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limited', code: 'RATE_LIMIT' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required', code: 'PAYMENT_REQUIRED' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';
    
    // Parse the JSON object from the response
    let categorized: Record<string, string[]> = {};
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      categorized = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse AI response:', content);
      categorized = {};
    }

    return new Response(JSON.stringify({ categorized }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
