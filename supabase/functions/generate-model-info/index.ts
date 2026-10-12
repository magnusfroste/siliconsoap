import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAdmin } from "../_shared/adminGuard.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const denied = await requireAdmin(req, corsHeaders);
  if (denied) return denied;

  try {
    const { model_id, display_name, provider } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    if (typeof model_id !== 'string' || !model_id || model_id.length > 200) return json({ error: "model_id is required" }, 400);

    const systemPrompt = `You write short, strictly factual model descriptions for an AI model catalogue.
Write 1-2 plain sentences covering only: the lab that made the model and its country, the parameter size if officially published, the release month, and the license.
Omit any item you cannot state confidently — never guess, estimate or infer. No opinions, strengths, weaknesses, use cases or marketing language.
Respond with JSON only: {"description": "..."}`;

    const userPrompt = `Model ID: ${model_id}\nDisplay name: ${String(display_name || model_id).slice(0, 200)}\nProvider: ${String(provider || 'Unknown').slice(0, 100)}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status, await response.text());
      if (response.status === 429) return json({ error: "Rate limit exceeded. Please try again later." }, 429);
      if (response.status === 402) return json({ error: "Payment required. Please add credits." }, 402);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content: string | undefined = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content in AI response");

    let description = '';
    try {
      const m = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      description = String(JSON.parse(m ? m[1] : content).description ?? '').trim();
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse model description from AI");
    }
    if (!description) throw new Error("AI returned an empty description");

    return json({ description });
  } catch (error) {
    console.error("Error in generate-model-info:", error);
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});
