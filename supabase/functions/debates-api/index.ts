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

// ----- Public machine-readable schema (for agents without MCP) -----
const API_SCHEMA = {
  name: "SiliconSoap Debates API",
  version: "1.0",
  base_url: "https://apfrjuomozdvdeondzaz.supabase.co/functions/v1/debates-api",
  auth: {
    type: "bearer",
    header: "Authorization: Bearer sk_silicon_<your-key>",
    obtain: "https://www.siliconsoap.com (Admin -> API Keys)",
  },
  endpoints: {
    "GET /schema": { auth: false, description: "This document. JSON schema of the API." },
    "GET /llms.txt": { auth: false, description: "Plain-text docs optimized for LLM ingestion." },
    "GET /models": { auth: true, description: "List curated models usable in `models[]`." },
    "POST /debates": {
      auth: true,
      description: "Queue a debate. Returns 202 with poll_url. Costs 1 credit.",
      query: { sync: "Optional. `true` = block until done (may timeout for long debates)." },
      body_schema: {
        type: "object",
        required: ["topic", "models"],
        properties: {
          topic: { type: "string", maxLength: 2000, description: "Debate topic / question." },
          models: {
            type: "array",
            minItems: 2,
            maxItems: 3,
            items: { type: "string" },
            description: "Model IDs from GET /models. 2 or 3 agents.",
          },
          rounds: { type: "integer", minimum: 1, maximum: 5, default: 2 },
          scenario_id: {
            type: "string",
            enum: ["general-problem", "ethical-dilemma", "future-prediction"],
            default: "general-problem",
          },
          personas: {
            type: "array",
            items: { enum: ["analytical", "creative", "strategic", "empathetic"] },
            description: "One persona per agent. Defaults to analytical/creative/strategic.",
          },
          agent_names: {
            type: "array",
            items: { type: "string" },
            description: "Display names. Defaults to Agent A/B/C.",
          },
          response_length: { enum: ["short", "medium", "long"], default: "medium" },
          conversation_tone: {
            enum: ["formal", "casual", "heated", "collaborative"],
            default: "casual",
          },
          agreement_bias: {
            type: "integer",
            minimum: 0,
            maximum: 100,
            default: 50,
            description: "0 = combative, 100 = agreeable.",
          },
          personality_intensity: {
            enum: ["mild", "moderate", "extreme"],
            default: "moderate",
          },
        },
      },
      response_202: {
        id: "uuid",
        status: "queued",
        total_rounds: "integer",
        credits_remaining: "integer",
        poll_url: "/debates-api/debates/{id}/status",
      },
    },
    "GET /debates": {
      auth: true,
      description: "List your debates (latest first).",
      query: { limit: "1-100, default 20" },
    },
    "GET /debates/:id/status": {
      auth: true,
      description: "Lightweight poll. Status is queued | running | completed | failed.",
      response: {
        id: "uuid",
        status: "queued|running|completed|failed",
        current_round: "integer",
        total_rounds: "integer",
        messages_so_far: "integer",
        error: "string|null",
      },
    },
    "GET /debates/:id": {
      auth: true,
      description: "Full transcript + chat metadata after completion.",
      response: {
        debate: "agent_chats row (settings, prompt, share_id, ...)",
        messages: "array of { agent, persona, message, model, created_at }",
        status: "queued|running|completed|failed",
      },
    },
  },
  errors: {
    "400": "Validation error in body",
    "401": "Missing / invalid / revoked API key",
    "402": "Out of credits",
    "404": "Resource not found or not yours",
    "502": "Upstream model failure mid-debate",
  },
  recommended_flow: [
    "POST /debates -> get { id, poll_url }",
    "Poll GET /debates/{id}/status every 2-3s until status === 'completed'",
    "GET /debates/{id} for full transcript",
  ],
};

const LLMS_TXT = `# SiliconSoap Debates API

Run multi-agent AI debates programmatically. Each debate = 2 or 3 LLM agents (different models, different personas) debating a topic across N rounds.

## Base URL
https://apfrjuomozdvdeondzaz.supabase.co/functions/v1/debates-api

## Auth
Authorization: Bearer sk_silicon_<your-key>
Get a key at https://www.siliconsoap.com (Admin -> API Keys). 1 debate = 1 credit.

## Discovery (no auth)
GET /schema     -> Full JSON schema of every endpoint and field.
GET /llms.txt   -> This document.

## Endpoints

### GET /models
List model_ids you can pass to \`models\`. Returns { models: [{ model_id, display_name, provider, ... }] }.

### POST /debates
Queue a debate. Returns 202 immediately with a poll_url.

Body (JSON):
- topic            string, required, <=2000 chars
- models           string[2..3], required, model_ids from /models
- rounds           1-5 (default 2)
- scenario_id      "general-problem" | "ethical-dilemma" | "future-prediction"
- personas         ("analytical"|"creative"|"strategic"|"empathetic")[]
- agent_names      string[] (display names)
- response_length  "short" | "medium" | "long"
- conversation_tone "formal" | "casual" | "heated" | "collaborative"
- agreement_bias   0 (combative) - 100 (agreeable)
- personality_intensity "mild" | "moderate" | "extreme"

Example request:
{
  "topic": "Should AI agents have legal rights?",
  "models": ["openai/gpt-5-mini", "anthropic/claude-3.5-sonnet"],
  "personas": ["analytical", "creative"],
  "rounds": 2,
  "conversation_tone": "heated",
  "agreement_bias": 20,
  "personality_intensity": "extreme"
}

Example 202 response:
{
  "id": "7a978df5-b45a-4e5d-86f9-f8d968f028e6",
  "status": "queued",
  "total_rounds": 2,
  "credits_remaining": 42,
  "poll_url": "/debates-api/debates/7a978df5-.../status"
}

### GET /debates/:id/status
{ "id": "...", "status": "running", "current_round": 1, "total_rounds": 2, "messages_so_far": 2, "error": null }

### GET /debates/:id
{ "debate": { ... }, "messages": [{ "agent": "Agent A", "persona": "analytical", "message": "...", "model": "openai/gpt-5-mini", "created_at": "..." }], "status": "completed" }

### GET /debates?limit=20
List caller's debates, newest first.

## Errors
400 validation | 401 bad key | 402 out of credits | 404 not yours | 502 upstream model failure

## Recommended agent flow
1. POST /debates -> get { id, poll_url }
2. Poll /status every 2-3s until status === "completed"
3. GET /debates/{id} for transcript

Debates created via API are public + shareable (share_id is included in the response).
`;



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

// ----- Soap-opera name generator (mirrors frontend agentNameGenerator.ts) -----
const MALE_FIRST_NAMES = [
  "J.R.","Blake","Ridge","Eric","Victor","Jack","Tad","Luke","Sonny","Jason",
  "Bo","John","Stefano","Ross","Chandler","Big","Don","Roger","Chuck","Nate","Dan",
];
const FEMALE_FIRST_NAMES = [
  "Alexis","Krystle","Fallon","Brooke","Stephanie","Taylor","Nikki","Erica","Laura","Carly",
  "Hope","Marlena","Rachel","Monica","Phoebe","Carrie","Samantha","Charlotte","Miranda",
  "Peggy","Betty","Joan","Serena","Blair",
];
const SOAP_LAST_NAMES = [
  "Ewing","Carrington","Colby","Forrester","Newman","Abbott","Chancellor","Kane","Martin","Quartermaine",
  "Spencer","Corinthos","Brady","DiMera","Horton","Buchanan","Chandler","Santos","Montgomery","Hayward",
  "van der Woodsen","Waldorf","Bass","Archibald","Humphrey","Bradshaw","York","Hobbes","Sterling","Draper",
];
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}
function buildSoapName(letter: string, persona: string, usedFirst: Set<string>): string {
  const gender = letter === "B" ? "female" : "male";
  const firstNames = gender === "male" ? MALE_FIRST_NAMES : FEMALE_FIRST_NAMES;
  const hash = hashString(`Agent ${letter}-${persona}`);
  let idx = hash % firstNames.length;
  let first = firstNames[idx];
  let attempts = 0;
  while (usedFirst.has(first) && attempts < firstNames.length) {
    idx = (idx + 1) % firstNames.length;
    first = firstNames[idx];
    attempts++;
  }
  usedFirst.add(first);
  const last = SOAP_LAST_NAMES[(hash >> 4) % SOAP_LAST_NAMES.length];
  return `${first} ${last}`;
}
function replaceAgentMentions(text: string, map: Record<string, string>): string {
  if (!text || Object.keys(map).length === 0) return text;
  return text.replace(/\bAgents?\s+([ABC])\b/g, (_m, l: string) => map[l.toUpperCase()] ?? _m);
}

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

  // ===== Public (no auth) discovery endpoints — agent-friendly =====
  if (req.method === "GET" && resource === "schema") {
    return json(API_SCHEMA);
  }
  if (req.method === "GET" && (resource === "llms.txt" || resource === "docs.txt")) {
    return new Response(LLMS_TXT, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" },
    });
  }

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

    // ===== GET /debates/:id/status  (lightweight polling) =====
    if (
      req.method === "GET" &&
      resource === "debates" &&
      resourceId &&
      route[2] === "status"
    ) {
      const { data: chat, error: chatErr } = await supabase
        .from("agent_chats")
        .select(
          "id, run_status, run_error, run_current_round, run_total_rounds, run_started_at, run_completed_at",
        )
        .eq("id", resourceId)
        .eq("user_id", userId)
        .is("deleted_at", null)
        .maybeSingle();
      if (chatErr) return json({ error: chatErr.message }, 500);
      if (!chat) return json({ error: "Debate not found." }, 404);

      const { count } = await supabase
        .from("agent_chat_messages")
        .select("id", { count: "exact", head: true })
        .eq("chat_id", resourceId);

      return json({
        id: chat.id,
        status: chat.run_status ?? "completed",
        error: chat.run_error,
        current_round: chat.run_current_round,
        total_rounds: chat.run_total_rounds,
        messages_so_far: count ?? 0,
        started_at: chat.run_started_at,
        completed_at: chat.run_completed_at,
      });
    }

    // ===== GET /debates/:id  (full transcript) =====
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

      return json({
        debate: chat,
        messages: messages ?? [],
        status: chat.run_status ?? "completed",
      });
    }

    // ===== POST /debates  (create + run async) =====
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
      const wantSync = url.searchParams.get("sync") === "true";

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
          run_status: "queued",
          run_total_rounds: rounds,
          run_current_round: 0,
          run_started_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (chatErr || !chat) {
        return json(
          { error: `Failed to create debate: ${chatErr?.message}` },
          500,
        );
      }

      // ----- Orchestration (runs either inline or in background) -----
      const runOrchestration = async () => {
        const history: PriorMessage[] = [];
        try {
          await supabase
            .from("agent_chats")
            .update({ run_status: "running" })
            .eq("id", chat.id);

          let messagesInserted = 0;
          let lastSoftError: string | null = null;

          for (let r = 1; r <= rounds; r++) {
            await supabase
              .from("agent_chats")
              .update({ run_current_round: r })
              .eq("id", chat.id);

            for (const agent of agents) {
              (agent as any).__totalRounds = rounds;
              const sys = buildSystemPrompt(agent, input);
              const usr = buildUserPrompt(agent, input.topic, history, r);
              const disableReasoning =
                curatedMap.get(agent.model)?.disable_reasoning === true;

              // Retry once on empty/transient errors before giving up on this turn.
              let content = "";
              let usage: any = undefined;
              let modelUsed: string | undefined;
              let turnError: string | null = null;
              for (let attempt = 1; attempt <= 2; attempt++) {
                try {
                  const result = await callOpenRouter(
                    OPENROUTER_KEY,
                    agent.model,
                    sys,
                    usr,
                    disableReasoning,
                  );
                  content = result.content;
                  usage = result.usage;
                  modelUsed = result.modelUsed;
                  turnError = null;
                  break;
                } catch (err: any) {
                  turnError = err?.message ?? "unknown error";
                  console.warn(
                    `Debate ${chat.id} round ${r} agent ${agent.letter} attempt ${attempt} failed: ${turnError}`,
                  );
                }
              }

              if (turnError) {
                // Skip this turn but keep the debate going.
                lastSoftError = turnError;
                continue;
              }

              const { error: insertErr } = await supabase
                .from("agent_chat_messages")
                .insert({
                  chat_id: chat.id,
                  agent: `Agent ${agent.letter}`,
                  persona: agent.persona,
                  message: content,
                  model: agent.model,
                });
              if (insertErr) throw new Error(insertErr.message);
              messagesInserted++;
              history.push({ agent_name: agent.name, message: content });

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

          // If we produced at least one message, treat as completed even if some
          // turns were skipped due to upstream model errors.
          if (messagesInserted === 0) {
            throw new Error(lastSoftError ?? "No messages produced");
          }

          await supabase
            .from("agent_chats")
            .update({
              run_status: "completed",
              run_completed_at: new Date().toISOString(),
              run_error: lastSoftError, // null if everything was clean
            })
            .eq("id", chat.id);
        } catch (e: any) {
          console.error(`Debate ${chat.id} failed:`, e);
          await supabase
            .from("agent_chats")
            .update({
              run_status: "failed",
              run_error: e?.message ?? "unknown error",
              run_completed_at: new Date().toISOString(),
            })
            .eq("id", chat.id);
        }
      };


      // ----- Sync mode (opt-in via ?sync=true) — kept for back-compat -----
      if (wantSync) {
        await runOrchestration();
        const { data: messages } = await supabase
          .from("agent_chat_messages")
          .select("id, agent, persona, message, model, created_at")
          .eq("chat_id", chat.id)
          .order("created_at", { ascending: true });
        const { data: finalChat } = await supabase
          .from("agent_chats")
          .select("*")
          .eq("id", chat.id)
          .single();
        return json(
          {
            debate: finalChat,
            messages: messages ?? [],
            status: finalChat?.run_status ?? "completed",
            credits_remaining: result.new_remaining,
          },
          201,
        );
      }

      // ----- Async mode (default): return immediately, run in background -----
      // @ts-ignore EdgeRuntime is available in Supabase edge runtime
      EdgeRuntime.waitUntil(runOrchestration());

      return json(
        {
          id: chat.id,
          status: "queued",
          total_rounds: rounds,
          credits_remaining: result.new_remaining,
          poll_url: `/debates-api/debates/${chat.id}/status`,
          message:
            "Debate queued. Poll GET /debates/:id/status every 2-3s, then GET /debates/:id when status is 'completed'.",
        },
        202,
      );
    }

    return json({ error: "Not found." }, 404);
  } catch (e: any) {
    console.error("debates-api error:", e);
    return json({ error: e?.message ?? "Internal error" }, 500);
  }
});
