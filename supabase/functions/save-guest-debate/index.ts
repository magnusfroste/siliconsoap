import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sanitizeAnsweredBy } from "./answeredBy.ts";
import { guestLookupSince, validClientKey } from "./idempotency.ts";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

function generateShareId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, scenarioId, settings, messages, sessionId, title, clientKey } = await req.json();

    if (!validClientKey(clientKey)) {
      return new Response(JSON.stringify({ error: "clientKey must be a string of 1–64 characters" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!prompt || !scenarioId || !messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: prompt, scenarioId, messages" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role to bypass RLS
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check feature flag
    const { data: flag } = await supabase
      .from("feature_flags")
      .select("enabled")
      .eq("key", "auto_save_guest_debates")
      .single();

    if (flag && !flag.enabled) {
      return new Response(
        JSON.stringify({ error: "Guest debate saving is disabled" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const since = guestLookupSince(clientKey, Date.now());
    if (since) {
      const { data: existing, error: lookupError } = await supabase
        .from("agent_chats")
        .select("id, share_id")
        .is("user_id", null)
        .eq("settings->>client_key", clientKey)
        .gte("created_at", since)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (lookupError) throw lookupError;
      if (existing) {
        return new Response(JSON.stringify({ chatId: existing.id, shareId: existing.share_id }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const shareId = generateShareId();

    // Insert the chat
    const { data: chat, error: chatError } = await supabase
      .from("agent_chats")
      .insert({
        user_id: null,
        title: title || prompt.slice(0, 80),
        prompt,
        scenario_id: scenarioId,
        settings: clientKey ? { ...(settings || {}), client_key: clientKey } : settings || {},
        is_public: true,
        share_id: shareId,
      })
      .select("id")
      .single();

    if (chatError) {
      console.error("Error inserting guest chat:", chatError);
      return new Response(
        JSON.stringify({ error: "Failed to save debate" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert messages
    const messagesToInsert = messages.map((msg: any) => ({
      chat_id: chat.id,
      agent: msg.agent,
      message: msg.message,
      model: msg.model || "unknown",
      persona: msg.persona || "default",
      answered_by_model: sanitizeAnsweredBy(msg.answeredByModel),
    }));

    const { error: msgError } = await supabase
      .from("agent_chat_messages")
      .insert(messagesToInsert);

    if (msgError) {
      console.error("Error inserting guest messages:", msgError);
      // Chat was created but messages failed - still return the share link
    }

    return new Response(
      JSON.stringify({ chatId: chat.id, shareId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in save-guest-debate:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
