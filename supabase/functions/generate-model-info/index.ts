import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { model_id, display_name, provider } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!model_id) {
      throw new Error("model_id is required");
    }

    console.log(`Generating info for model: ${model_id}`);

    const systemPrompt = `You are an AI model expert. Generate educational content about AI models for a learning platform.
Your responses should be accurate, helpful, and suitable for developers and AI enthusiasts.
Always respond with valid JSON matching the exact structure requested.`;

    const userPrompt = `Generate educational information about this AI model:

Model ID: ${model_id}
Display Name: ${display_name || model_id}
Provider: ${provider || 'Unknown'}

Respond with a JSON object containing:
{
  "description": "A 2-3 sentence description of the model, its capabilities, and what makes it unique",
  "pros": ["3-4 key strengths of this model"],
  "cons": ["2-3 limitations or trade-offs"],
  "use_cases": ["3-4 ideal use cases, e.g., 'Code generation', 'Creative writing'"],
  "avoid_cases": ["2-3 scenarios where other models might be better"],
  "category": "One of: 'reasoning', 'creative', 'fast', 'balanced'",
  "speed_rating": "One of: 'fast', 'medium', 'slow'",
  "context_window": "The context window in tokens (number only, e.g., 128000)"
}

Base your response on your knowledge of this model. If you're not sure about specific details, make reasonable inferences based on the model name and provider.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from the response
    let modelInfo;
    try {
      // Try to extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                        content.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, content];
      modelInfo = JSON.parse(jsonMatch[1] || content);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse model information from AI");
    }

    console.log(`Successfully generated info for ${model_id}`);

    return new Response(JSON.stringify(modelInfo), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-model-info:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
