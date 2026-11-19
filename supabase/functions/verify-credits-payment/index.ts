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

    // Idempotent grant: one credit_purchases row per Stripe session, atomically with the balance update
    const { data: grantRows, error: grantError } = await supabaseClient.rpc("grant_purchased_credits", {
      p_session_id: session.id,
      p_user_id: user.id,
      p_credits: creditsToAdd,
      p_amount_total: session.amount_total ?? null,
      p_currency: session.currency ?? null,
    });
    if (grantError) throw grantError;
    const grant = Array.isArray(grantRows) ? grantRows[0] : grantRows;
    const granted = grant?.granted === true;
    logStep(granted ? "Credits granted" : "Session already processed", { newBalance: grant?.new_balance });

    return new Response(JSON.stringify({
      success: true,
      credits_added: granted ? creditsToAdd : 0,
      already_processed: !granted,
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
