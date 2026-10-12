# Architecture rules

- Keep Explore queries in its repository, archive derivation in a pure service and URL/request state in its controller hook; this preserves the view's UI-only boundary and enables rule-level tests.
- Embed transcript agent metadata alongside aggregate counts in each Explore page query; this excludes human turns from completion and resolves legacy casts without per-debate queries.

- Share debate transcript rendering and display-only round/claim derivation between owned and public views so their presentation cannot drift.
- Keep chat generation, accounting, persistence, playback, and analysis handlers unchanged during presentation updates; new presentation components receive their existing handlers as props.
- Preserve the legacy plain-text transcript and composer for this presentation-only change: AI Elements MessageResponse's Markdown rendering is incompatible with exact sentence highlighting and audio-timed character reveal, and migrating the composer/transcript foundations would change the explicitly preserved input/playback behaviour.- Put shared-key abuse guards (model allowlist, token clamp, input size, hashed-IP rate limit via bump_rate_limit) in supabase/functions/_shared/requestGuards.ts and apply them only to shared-key calls; BYOK and real-user behaviour must stay unchanged.
- The `agent` edge function is a hand-written, stateless MCP (Streamable HTTP JSON-RPC) server, separate from the SDK-generated `mcp`; it needs per-request key auth (?key= or Bearer) without OAuth, which the SDK handler does not expose to tools.
- Second-opinion panel logic lives in supabase/functions/_shared/panelEngine.ts (I/O) and panelPure.ts (pure, unit-tested); panels persist as private agent_chats with settings.mode = 'panel' so the normal transcript renderer works.

- Connector links use the repository/service/controller/view boundary; only authenticated server functions claim ownership, and atomic service-role RPCs transfer balances and refund panel failures to avoid duplicate credits.
- Keep panel synthesis types in domain models and render saved synthesis through a shared display-only component for private and public transcripts.

- Keep roster and scoreboard data access in repositories, derivation in pure services and query/filter state in controller hooks; views only render the results.
- Model scoreboard statistics come from a single aggregate-only security-definer RPC; never fetch private transcripts or auth email data in the browser.

- Profile overview reads owned activity in a repository, splits panels in a pure service and exposes query state through a hook; no connector key is rendered in the profile.
