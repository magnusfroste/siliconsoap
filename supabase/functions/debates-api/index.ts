// Public REST API for SiliconSoap debates.
// Lets external agents (Claude Cowork, n8n, etc.) create and read debates
// via API keys instead of UI automation.
//
// Auth: `Authorization: Bearer sk_silicon_<token>`
//
// Routes (path after /functions/v1/debates-api):
//   GET    /models           -> list available curated models
//   GET    /debates          -> list caller's debates
//   POST   /debates          -> create + run a debate (synchronous)
//   GET    /debates/:id      -> fetch debate + messages

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// ----- Hashing helper (SHA-256 hex of API key string) -----
async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ----- Persona library (matches frontend src/pages/agents-meetup/constants.tsx) -----
const PERSONAS: Record<string, string> = {
  analytical:
    "You are an Analytical Expert. Focus on detailed, factual analysis using logical reasoning and evidence. Be objective and rigorous.",
  creative:
    "You are a Creative Thinker. Prioritize novel ideas, unconventional perspectives, and unexpected connections. Use metaphors and analogies.",
  strategic:
    "You are a Strategic Planner. Focus on actionable plans, long-term goals, and practical implementation. Be concrete and pragmatic.",
  empathetic:
    "You are an Empathetic Advisor. Acknowledge emotional dimensions and human impact. Be supportive while still constructive.",
};

const TONE_INSTRUCTIONS: Record<string, string> = {
  formal: "Engage formally and professionally; cite evidence.",
  casual: "Be conversational and friendly; use everyday language.",
  heated: "Be passionate and assertive; directly challenge other viewpoints.",
  collaborative: "Build on others' ideas; find common ground.",
};

const INTENSITY_MODIFIERS: Record<string, string> = {
  mild: "Express your persona subtly; focus on content.",
  moderate: "Let your persona come through clearly.",
  extreme: "Strongly embody your persona with a distinctive voice.",
};

const LENGTH_INSTRUCTIONS: Record<string, string> = {
  short: "Respond in 1-2 concise sentences.",
  medium: "Respond in 3-5 sentences.",
  long: "Respond with a detailed paragraph (6-10 sentences).",
};

interface DebateAgent {
  letter: string; // "A" | "B" | "C"
  name: string;
  persona: string;
  model: string;
}

interface DebateInput {
  topic: string;
  scenario_id?: string;
  models: string[];
  personas?: string[];
  rounds?: number;
  response_length?: "short" | "medium" | "long";
  conversation_tone?: "formal" | "casual" | "heated" | "collaborative";
  agreement_bias?: number; // 0-100
  personality_intensity?: "mild" | "moderate" | "extreme";
  agent_names?: string[];
}

function buildSystemPrompt(
  agent: DebateAgent,
  input: DebateInput,
): string {
  const personaText =
    PERSONAS[agent.persona] ??
    `You are an AI agent embodying the "${agent.persona}" archetype.`;
  const tone = TONE_INSTRUCTIONS[input.conversation_tone ?? "casual"];
  const intensity =
    INTENSITY_MODIFIERS[input.personality_intensity ?? "moderate"];
  const length = LENGTH_INSTRUCTIONS[input.response_length ?? "medium"];
  const bias = input.agreement_bias ?? 50;
  const stance =
    bias < 30
      ? "Challenge and critically examine other perspectives. Play devil's advocate."
      : bias > 70
        ? "Look for areas of agreement. Build on others' ideas."
        : "Balance agreement and disagreement based on the merits of the arguments.";

  return [
    `You are ${agent.name} (Agent ${agent.letter}).`,
    personaText,
    `Tone: ${tone}`,
    `Stance: ${stance}`,
    `Expression: ${intensity}`,
    `Length: ${length}`,
    `Refer to other participants by name when relevant. Stay in character.`,
    `Respond in the same language as the debate topic. Default to English.`,
  ].join("\n");
}

interface PriorMessage {
  agent_name: string;
  message: string;
}

function buildUserPrompt(
  agent: DebateAgent,
  topic: string,
  history: PriorMessage[],
  round: number,
): string {
  if (history.length === 0) {
    return `The debate topic is: "${topic}"\n\nYou are opening the discussion. Stake out your position clearly.`;
  }
  const transcript = history
    .map((m) => `${m.agent_name}: ${m.message}`)
    .join("\n\n");
  const isFinalRound = round === (agent as any).__totalRounds;
  const closer = isFinalRound
    ? "This is the final round — share your closing position."
    : "Respond to what has been said so far. Advance the debate.";
  return `Debate topic: "${topic}"\n\nConversation so far:\n\n${transcript}\n\nYour turn. ${closer}`;
}

async function callOpenRouter(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  disableReasoning: boolean,
): Promise<{ content: string; usage?: any; modelUsed?: string }> {
  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 600,
    temperature: 0.9,
    stream: false,
    usage: { include: true },
  };
  if (disableReasoning) body.reasoning = { enabled: false };

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://siliconsoap.com",
      "X-Title": "SiliconSoap API",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      `OpenRouter ${res.status}: ${data?.error?.message ?? "request failed"}`,
    );
  }
  const raw = data?.choices?.[0]?.message?.content;
  const content =
    typeof raw === "string"
      ? raw.trim()
      : Array.isArray(raw)
        ? raw
            .map((p: any) => (typeof p === "string" ? p : p?.text ?? ""))
            .join("")
            .trim()
        : "";
  if (!content) {
    throw new Error(`Empty response from ${model}`);
  }
  return { content, usage: data?.usage, modelUsed: data?.model };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const OPENROUTER_KEY = Deno.env.get("OPENROUTER_API_KEY");
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // ----- Parse path -----
  const url = new URL(req.url);
  // path looks like /debates-api/debates/<id> — strip the function name
  const segments = url.pathname.split("/").filter(Boolean);
  const fnIdx = segments.indexOf("debates-api");
  const route = fnIdx >= 0 ? segments.slice(fnIdx + 1) : segments;
  const [resource, resourceId] = route;

  // ----- Authenticate via API key -----
  const auth = req.headers.get("authorization") ?? "";
  const tokenMatch = auth.match(/^Bearer\s+(sk_silicon_[A-Za-z0-9]+)$/);
  if (!tokenMatch) {
    return json(
      {
        error: "Missing or malformed Authorization header.",
        hint: "Use `Authorization: Bearer sk_silicon_...`",
      },
      401,
    );
  }
  const presentedKey = tokenMatch[1];
  const keyHash = await sha256Hex(presentedKey);

  const { data: keyRow, error: keyErr } = await supabase
    .from("api_keys")
    .select("id, user_id, revoked_at")
    .eq("key_hash", keyHash)
    .maybeSingle();

  if (keyErr || !keyRow || keyRow.revoked_at) {
    return json({ error: "Invalid or revoked API key." }, 401);
  }

  const userId: string = keyRow.user_id;

  // Touch last_used_at (fire-and-forget)
  supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", keyRow.id)
    .then(() => {});

  try {
    // ===== GET /models =====
    if (req.method === "GET" && resource === "models") {
      const { data, error } = await supabase
        .from("curated_models")
        .select(
          "model_id, display_name, provider, price_tier, is_free, license_type, context_window, category",
        )
        .eq("is_enabled", true)
        .order("sort_order", { ascending: true });
      if (error) return json({ error: error.message }, 500);
      return json({ models: data ?? [] });
    }

    // ===== GET /debates  (list) =====
    if (req.method === "GET" && resource === "debates" && !resourceId) {
      const limit = Math.min(
        parseInt(url.searchParams.get("limit") ?? "20", 10) || 20,
        100,
      );
      const { data, error } = await supabase
        .from("agent_chats")
        .select("id, title, prompt, scenario_id, settings, created_at, share_id, is_public")
        .eq("user_id", userId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) return json({ error: error.message }, 500);
      return json({ debates: data ?? [] });
    }

    // ===== GET /debates/:id =====
    if (req.method === "GET" && resource === "debates" && resourceId) {
      const { data: chat, error: chatErr } = await supabase
        .from("agent_chats")
        .select("*")
        .eq("id", resourceId)
        .eq("user_id", userId)
        .is("deleted_at", null)
        .maybeSingle();
      if (chatErr) return json({ error: chatErr.message }, 500);
      if (!chat) return json({ error: "Debate not found." }, 404);

      const { data: messages, error: msgErr } = await supabase
        .from("agent_chat_messages")
        .select("id, agent, persona, message, model, created_at")
        .eq("chat_id", resourceId)
        .order("created_at", { ascending: true });
      if (msgErr) return json({ error: msgErr.message }, 500);

      return json({ debate: chat, messages: messages ?? [] });
    }

    // ===== POST /debates  (create + run) =====
    if (req.method === "POST" && resource === "debates") {
      if (!OPENROUTER_KEY) {
        return json({ error: "Server missing OPENROUTER_API_KEY." }, 500);
      }

      let input: DebateInput;
      try {
        input = await req.json();
      } catch {
        return json({ error: "Invalid JSON body." }, 400);
      }

      // ----- Validate -----
      if (!input.topic || typeof input.topic !== "string" || input.topic.length > 2000) {
        return json({ error: "`topic` is required (string, max 2000 chars)." }, 400);
      }
      if (!Array.isArray(input.models) || input.models.length < 2 || input.models.length > 3) {
        return json({ error: "`models` must be an array of 2 or 3 model ids." }, 400);
      }
      const rounds = Math.min(Math.max(input.rounds ?? 2, 1), 5);
      const scenario = input.scenario_id ?? "general-problem";

      // ----- Validate models against curated_models -----
      const { data: curated } = await supabase
        .from("curated_models")
        .select("model_id, disable_reasoning, is_enabled")
        .in("model_id", input.models);
      const curatedMap = new Map(
        (curated ?? []).map((m) => [m.model_id, m]),
      );
      for (const m of input.models) {
        if (!curatedMap.has(m) || curatedMap.get(m)!.is_enabled === false) {
          return json(
            { error: `Model "${m}" is not available. GET /models for the list.` },
            400,
          );
        }
      }

      // ----- Check + deduct credit -----
      const { data: creditResult, error: creditErr } = await supabase.rpc(
        "use_credit",
        { p_user_id: userId },
      );
      if (creditErr) return json({ error: creditErr.message }, 500);
      const result = Array.isArray(creditResult) ? creditResult[0] : creditResult;
      if (!result?.success) {
        return json(
          {
            error: "Out of credits.",
            credits_remaining: result?.new_remaining ?? 0,
          },
          402,
        );
      }

      // ----- Build agents -----
      const personas = input.personas ?? ["analytical", "creative", "strategic"];
      const defaultNames = ["Agent A", "Agent B", "Agent C"];
      const agents: DebateAgent[] = input.models.map((model, i) => ({
        letter: ["A", "B", "C"][i],
        name: input.agent_names?.[i] ?? defaultNames[i],
        persona: personas[i] ?? "analytical",
        model,
      }));

      // ----- Build settings + create chat row -----
      const settings = {
        numberOfAgents: agents.length,
        rounds,
        responseLength: input.response_length ?? "medium",
        participationMode: "spectator",
        turnOrder: "sequential",
        models: {
          agentA: agents[0].model,
          agentB: agents[1]?.model,
          agentC: agents[2]?.model,
        },
        personas: {
          agentA: agents[0].persona,
          agentB: agents[1]?.persona,
          agentC: agents[2]?.persona,
        },
        conversationTone: input.conversation_tone ?? "casual",
        agreementBias: input.agreement_bias ?? 50,
        personalityIntensity: input.personality_intensity ?? "moderate",
        temperature: 0.9,
        created_via: "api",
      };

      const title =
        input.topic.length > 60
          ? input.topic.slice(0, 57) + "..."
          : input.topic;

      const { data: chat, error: chatErr } = await supabase
        .from("agent_chats")
        .insert({
          user_id: userId,
          title,
          scenario_id: scenario,
          prompt: input.topic,
          settings,
        })
        .select()
        .single();
      if (chatErr || !chat) {
        return json(
          { error: `Failed to create debate: ${chatErr?.message}` },
          500,
        );
      }

      // ----- Run orchestration (synchronous, sequential turns) -----
      const history: PriorMessage[] = [];
      const savedMessages: any[] = [];

      try {
        for (let r = 1; r <= rounds; r++) {
          for (const agent of agents) {
            (agent as any).__totalRounds = rounds;
            const sys = buildSystemPrompt(agent, input);
            const usr = buildUserPrompt(agent, input.topic, history, r);
            const disableReasoning =
              curatedMap.get(agent.model)?.disable_reasoning === true;

            const { content, usage, modelUsed } = await callOpenRouter(
              OPENROUTER_KEY,
              agent.model,
              sys,
              usr,
              disableReasoning,
            );

            const { data: inserted, error: insertErr } = await supabase
              .from("agent_chat_messages")
              .insert({
                chat_id: chat.id,
                agent: `Agent ${agent.letter}`,
                persona: agent.persona,
                message: content,
                model: agent.model,
              })
              .select()
              .single();
            if (insertErr) throw new Error(insertErr.message);
            savedMessages.push(inserted);
            history.push({ agent_name: agent.name, message: content });

            // Log token usage
            if (usage) {
              await supabase.from("user_token_usage").insert({
                user_id: userId,
                chat_id: chat.id,
                model_id: modelUsed ?? agent.model,
                requested_model_id: agent.model,
                prompt_tokens: usage.prompt_tokens ?? 0,
                completion_tokens: usage.completion_tokens ?? 0,
                total_tokens: usage.total_tokens ?? 0,
                estimated_cost: 0,
              });
            }
          }
        }
      } catch (e: any) {
        return json(
          {
            error: `Debate failed mid-run: ${e?.message ?? "unknown error"}`,
            debate_id: chat.id,
            partial_messages: savedMessages.length,
          },
          502,
        );
      }

      return json(
        {
          debate: chat,
          messages: savedMessages,
          credits_remaining: result.new_remaining,
        },
        201,
      );
    }

    return json({ error: "Not found." }, 404);
  } catch (e: any) {
    console.error("debates-api error:", e);
    return json({ error: e?.message ?? "Internal error" }, 500);
  }
});
