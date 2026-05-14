# Sharpen the SiliconSoap Agents

Two phases. Phase 1 ships immediately (high impact, low risk). Phase 2 follows once phase 1 is verified in production.

## Phase 1 — Ship now

### 1. Inner Monologue / Scratchpad
Each agent first produces private `<thinking>...</thinking>` reasoning, then their public reply. Stored alongside the message but hidden by default.

- **Backend**: `agentPrompts.ts` adds a "Think privately first, then speak publicly" instruction. `conversationManager.ts` parses the model output, splits scratchpad from public text, stores both.
- **DB**: new column `messages.thinking text` (nullable).
- **UI**: per-message "🧠 Inner thoughts" expandable section. Off by default, opt-in toggle in chat header ("Show agent thoughts").
- **Cost**: ~30% more tokens per turn — admin flag `enable_scratchpad` to disable globally.

### 2. Stronger Persona Anchoring (Nous-style template)
Refactor agent system prompts into a strict structured template:

```text
[IDENTITY]        — name, archetype, one-line essence
[CORE BELIEFS]    — 3 non-negotiable convictions
[VOICE]           — tone, vocabulary level, signature phrases
[FORBIDDEN]       — things this agent never says/does
[DEBATE STRATEGY] — how they attack, defend, concede
[TONE CALIBRATION]— intensity slider mapping
```

- **Backend only**: rewrite `agentPrompts.ts` `buildSystemPrompt()`. No DB or UI changes — existing personas keep working, prompts just get assembled into the new structure.
- **Effect**: agents stay in character through round 5+, less "everyone sounds the same" drift.

### 3. Web Search Tool (admin-configurable provider)
Agents can call a `web_search` tool mid-debate to ground arguments in real facts.

**Provider options** (admin selects one in Admin Panel):

| Provider   | Free tier        | Setup       | Recommended for |
|------------|------------------|-------------|-----------------|
| DuckDuckGo | Unlimited (free) | No API key  | Default — zero cost, instant |
| Tavily     | 1000/month free  | API key     | Best LLM-tuned results |
| Brave      | 2000/month free  | API key     | Best general search |
| Firecrawl  | Paid             | API key     | Already in connector list |

- **DB**: new feature flag rows `web_search_enabled` (boolean) + `web_search_provider` (enum).
- **Edge function**: `agent-web-search` — provider-agnostic wrapper, switches on the configured provider, returns `[{title, url, snippet}]`.
- **Tool integration**: `openrouter-chat` edge function gets a `tools` parameter; agent can emit a tool-call, the function loops one round of search → injects results → final answer.
- **Per-persona opt-in**: a boolean column `agent_profiles.can_search` (default true for analytical personas, false for "bullshitter" personas — keeps debate variety).
- **UI badges**: messages that used search show a small 🔍 + source links underneath.
- **Admin Panel**: new "Web Search" card with provider dropdown, enable toggle, and API-key setup help.

### 4. Settings UI for users
New section in chat settings drawer (`SettingsDrawer.tsx`):
- Toggle: "Show agent inner thoughts" (per-debate)
- Toggle: "Allow agents to search the web" (per-debate, gated by admin flag)

## Phase 2 — Next iteration (not in this build)

### 5. Persistent Agent Memory (Honcho-style)
- New `agent_memories` table with `agent_id`, `embedding`, `content`, `weight`.
- Edge function `agent-memory-recall`: top-K vector search before each turn, injects "you remember that…" into prompt.
- Memory writer: post-debate summarization extracts key stances/grudges per agent.
- Requires pgvector extension + embedding generation pipeline — substantial work.

### 6. Self-Critique Pass
- Second LLM call after each agent reply: "Is this in character? Sharp enough?"
- Configurable per-model (cheap models: skip; premium: always on).
- Adds latency — needs careful UX (streaming, "polishing reply…" indicator).

## Technical Details

### Files to add (Phase 1)
- `supabase/functions/agent-web-search/index.ts` — provider-agnostic search wrapper
- `src/services/webSearchService.ts` — client-side helper (just calls edge function)

### Files to modify (Phase 1)
- `supabase/functions/openrouter-chat/index.ts` — accept `tools`, handle tool-call loop
- `src/pages/agents-meetup/hooks/conversation/agent/agentPrompts.ts` — new template + scratchpad instruction
- `src/pages/agents-meetup/hooks/conversation/agent/conversationManager.ts` — parse `<thinking>` tags
- `src/pages/agents-meetup/components/ChatMessage.tsx` — render thinking section + search badges
- `src/components/labs/SettingsDrawer.tsx` — two new toggles
- `src/pages/Admin*` — Web Search settings card
- `src/repositories/featureFlagsRepository.ts` — new flag keys

### DB migrations (Phase 1)
```sql
ALTER TABLE messages ADD COLUMN thinking text;
ALTER TABLE messages ADD COLUMN search_sources jsonb;
ALTER TABLE agent_profiles ADD COLUMN can_search boolean DEFAULT true;
INSERT INTO feature_flags (key, value) VALUES
  ('enable_scratchpad', 'true'),
  ('web_search_enabled', 'false'),
  ('web_search_provider', '"duckduckgo"');
```

### Secrets (only if non-DDG provider chosen)
- `TAVILY_API_KEY` — added on demand if admin selects Tavily
- `BRAVE_SEARCH_API_KEY` — added on demand if admin selects Brave
- Firecrawl already available via connector

## Confirm before I build

1. **Default provider**: DuckDuckGo (free, no key). Confirm OK?
2. **Scratchpad default**: hidden in UI, but always generated (so users can toggle on retroactively). OK?
3. **Web search default**: globally **off** until admin enables it (avoids surprise costs/calls). OK?
4. **Phase 2** items (memory + self-critique): leave for next round, or do you want any of them included now?

Reply "kör" and I build Phase 1 end-to-end.
