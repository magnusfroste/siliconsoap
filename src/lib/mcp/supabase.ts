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

/**
 * Append an immutable entry to `agent_activity_log` so every write an agent
 * performs over MCP is verifiable afterwards. Never throws — a logging failure
 * must not fail the tool call itself.
 */
export async function logAgentAction(
  ctx: ToolContext,
  entry: {
    tool_name: string;
    action?: string;
    target_type?: string;
    target_id?: string | null;
    success: boolean;
    error_message?: string | null;
    input?: unknown;
    result?: unknown;
    duration_ms?: number;
  },
): Promise<void> {
  try {
    const userId = ctx.getUserId();
    if (!userId) return;
    await supabaseForUser(ctx)
      .from("agent_activity_log")
      .insert({
        actor_user_id: userId,
        actor_label: ctx.getUserEmail?.() ?? null,
        client_id: ctx.getClientId?.() ?? null,
        source: "mcp",
        tool_name: entry.tool_name,
        action: entry.action ?? "write",
        target_type: entry.target_type ?? null,
        target_id: entry.target_id ?? null,
        success: entry.success,
        error_message: entry.error_message ?? null,
        input: (entry.input ?? {}) as Record<string, unknown>,
        result: (entry.result ?? {}) as Record<string, unknown>,
        duration_ms: entry.duration_ms ?? null,
      });
  } catch {
    // logging is best-effort
  }
}

/**
 * Runs an admin write and records it in the audit log, whatever the outcome.
 */
export async function audited<T>(
  ctx: ToolContext,
  meta: { tool_name: string; action?: string; target_type?: string; target_id?: string | null; input?: unknown },
  run: () => Promise<T>,
): Promise<T> {
  const startedAt = Date.now();
  try {
    const result = await run();
    const failed = (result as { isError?: boolean } | null)?.isError === true;
    await logAgentAction(ctx, {
      ...meta,
      success: !failed,
      error_message: failed ? "tool returned an error" : null,
      result: (result as { structuredContent?: unknown })?.structuredContent ?? {},
      duration_ms: Date.now() - startedAt,
    });
    return result;
  } catch (err) {
    await logAgentAction(ctx, {
      ...meta,
      success: false,
      error_message: err instanceof Error ? err.message : String(err),
      duration_ms: Date.now() - startedAt,
    });
    throw err;
  }
}
