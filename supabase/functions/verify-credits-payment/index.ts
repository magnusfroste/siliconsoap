import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-CREDITS-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.id) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Session ID is required");
    logStep("Session ID received", { sessionId });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Session retrieved", { 
      status: session.payment_status, 
      metadata: session.metadata 
    });

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    // Verify user matches
    if (session.metadata?.user_id !== user.id) {
      throw new Error("User mismatch");
    }

    const creditsToAdd = parseInt(session.metadata?.credits || "0", 10);
    if (creditsToAdd <= 0) {
      throw new Error("Invalid credits amount");
    }
    logStep("Credits to add", { credits: creditsToAdd });

    // Check if already processed (idempotency)
    const { data: existingCredits } = await supabaseClient
      .from("user_credits")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Add credits to user
    if (existingCredits) {
      const { error: updateError } = await supabaseClient
        .from("user_credits")
        .update({
          credits_remaining: existingCredits.credits_remaining + creditsToAdd,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (updateError) throw updateError;
      logStep("Credits updated", { 
        newTotal: existingCredits.credits_remaining + creditsToAdd 
      });
    } else {
      const { error: insertError } = await supabaseClient
        .from("user_credits")
        .insert({
          user_id: user.id,
          credits_remaining: creditsToAdd,
          credits_used: 0,
        });

      if (insertError) throw insertError;
      logStep("Credits record created", { credits: creditsToAdd });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      credits_added: creditsToAdd 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
