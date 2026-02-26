import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
    const { prompt, scenarioId, settings, messages, sessionId, title } = await req.json();

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

    const shareId = generateShareId();

    // Insert the chat
    const { data: chat, error: chatError } = await supabase
      .from("agent_chats")
      .insert({
        user_id: null,
        title: title || prompt.slice(0, 80),
        prompt,
        scenario_id: scenarioId,
        settings: settings || {},
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
