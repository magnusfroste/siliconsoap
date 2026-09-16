// Exchanges a personal SiliconSoap API key (`sk_silicon_...`) for a short-lived
// Supabase Auth access token, so headless MCP clients (Claude Code, Hermes, ...)
// can talk to the MCP server without an interactive OAuth flow.
//
//   POST /functions/v1/mcp-token
//   Authorization: Bearer sk_silicon_<your-key>
//   -> { access_token, token_type: "bearer", expires_in, expires_at }

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

/** SHA-256 hex — identical to debates-api. */
async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const INVALID = { error: "Invalid or revoked API key." };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed. Use POST." }, 405);
  }

  const bearer =
    (req.headers.get("authorization") ?? "").match(/^Bearer\s+(.+)$/)?.[1]?.trim() ?? "";

  if (!/^sk_silicon_[A-Za-z0-9]+$/.test(bearer)) {
    return json(INVALID, 401);
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const keyHash = await sha256Hex(bearer);
  const { data: keyRow, error: keyErr } = await admin
    .from("api_keys")
    .select("id, user_id, revoked_at")
    .eq("key_hash", keyHash)
    .maybeSingle();

  if (keyErr || !keyRow || keyRow.revoked_at) {
    return json(INVALID, 401);
  }

  await admin
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", keyRow.id);

  // ----- Mint a real Supabase session for the key's owner (no email sent) -----
  const { data: userData, error: userErr } = await admin.auth.admin.getUserById(
    keyRow.user_id,
  );
  const email = userData?.user?.email;
  if (userErr || !email) {
    return json({ error: "Could not resolve the account for this API key." }, 401);
  }

  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  const hashedToken = linkData?.properties?.hashed_token;
  if (linkErr || !hashedToken) {
    return json({ error: "Could not issue an access token. Try again." }, 500);
  }

  const verifier = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: sessionData, error: verifyErr } = await verifier.auth.verifyOtp({
    type: "magiclink",
    token_hash: hashedToken,
  });
  const session = sessionData?.session;
  if (verifyErr || !session?.access_token) {
    return json({ error: "Could not issue an access token. Try again." }, 500);
  }

  // ----- Best-effort audit entry, written as the user itself -----
  try {
    const asUser = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${session.access_token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    await asUser.from("agent_activity_log").insert({
      actor_user_id: keyRow.user_id,
      actor_label: email,
      source: "mcp-token",
      tool_name: "api_key_exchange",
      action: "token",
      target_type: "api_key",
      target_id: keyRow.id,
      success: true,
      input: {},
      result: {},
    });
  } catch {
    // never fail the exchange because of logging
  }

  const expiresIn = session.expires_in ?? 3600;
  return json({
    access_token: session.access_token,
    token_type: "bearer",
    expires_in: expiresIn,
    expires_at:
      session.expires_at ?? Math.floor(Date.now() / 1000) + expiresIn,
  });
});
