// Shared Supabase client factory for the SiliconSoap MCP server.
// Import-safe: no env reads or I/O at module top level.
import { createClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";

type RuntimeGlobals = typeof globalThis & {
  Deno?: { env?: { get?: (name: string) => string | undefined } };
  process?: { env?: Record<string, string | undefined> };
};

function runtimeEnv(name: string): string | undefined {
  const runtime = globalThis as RuntimeGlobals;
  return runtime.Deno?.env?.get?.(name) ?? runtime.process?.env?.[name];
}

function configuredEnv(names: readonly string[]): string | undefined {
  for (const name of names) {
    const value = runtimeEnv(name)?.trim();
    if (value) return value;
  }
  return undefined;
}

export function supabaseProjectUrl(): string {
  const url = configuredEnv(["SUPABASE_URL", "VITE_SUPABASE_URL"]);
  if (!url) throw new Error("SUPABASE_URL (or VITE_SUPABASE_URL) is required");
  return url;
}

function supabasePublishableKey(): string {
  const direct = configuredEnv([
    "SUPABASE_PUBLISHABLE_KEY",
    "VITE_SUPABASE_PUBLISHABLE_KEY",
  ]);
  if (direct) return direct;
  const keyset = runtimeEnv("SUPABASE_PUBLISHABLE_KEYS");
  if (keyset) {
    try {
      const parsed: unknown = JSON.parse(keyset);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const keys = parsed as Record<string, unknown>;
        const key = [keys.default, ...Object.values(keys)]
          .find(
            (v): v is string =>
              typeof v === "string" && v.trim().startsWith("sb_publishable_"),
          )
          ?.trim();
        if (key) return key;
      }
    } catch {
      // Malformed dictionary; fall through to legacy names.
    }
  }
  const legacy = configuredEnv(["SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY"]);
  if (legacy) return legacy;
  throw new Error(
    "SUPABASE_PUBLISHABLE_KEY, SUPABASE_PUBLISHABLE_KEYS, or SUPABASE_ANON_KEY is required",
  );
}

/** No caller identity — RLS runs as `anon`. Public reads only. */
export function supabaseAnon() {
  return createClient(supabaseProjectUrl(), supabasePublishableKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Forwards the verified bearer token so RLS runs as the signed-in user. */
export function supabaseForUser(ctx: ToolContext) {
  const token = ctx.getToken();
  if (!token) throw new Error("This tool requires a verified OAuth token");
  return createClient(supabaseProjectUrl(), supabasePublishableKey(), {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Calls one of the app's edge functions as the signed-in user. */
export async function invokeFunction(
  ctx: ToolContext,
  name: string,
  init: { method?: string; body?: unknown; path?: string } = {},
): Promise<{ status: number; body: unknown }> {
  const token = ctx.getToken();
  if (!token) throw new Error("This tool requires a verified OAuth token");
  const url = `${supabaseProjectUrl()}/functions/v1/${name}${init.path ?? ""}`;
  const res = await fetch(url, {
    method: init.method ?? "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const text = await res.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {
    // keep raw text
  }
  return { status: res.status, body };
}

export function ok(payload: unknown, summary?: string) {
  return {
    content: [
      { type: "text" as const, text: summary ?? JSON.stringify(payload, null, 2) },
    ],
    structuredContent: payload as Record<string, unknown>,
  };
}

export function fail(message: string) {
  return { content: [{ type: "text" as const, text: message }], isError: true };
}

export function requireAuth(ctx: ToolContext): string {
  if (!ctx.isAuthenticated()) throw new Error("Not authenticated");
  const userId = ctx.getUserId();
  if (!userId) throw new Error("No user id on token");
  return userId;
}

/** True when the signed-in caller holds the `admin` role. */
export async function isAdmin(ctx: ToolContext): Promise<boolean> {
  const supabase = supabaseForUser(ctx);
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: ctx.getUserId(),
    _role: "admin",
  });
  if (error) return false;
  return data === true;
}
