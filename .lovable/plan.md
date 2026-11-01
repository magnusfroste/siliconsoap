# Investigation: failed debates on 2026-10-28 and 2026-10-25 (no code changes)

## What the logs show
- The logs no longer go back to either window, so I can't answer questions 1–3 from them.
- `openrouter-chat`: no log entries at all are kept.
- `log-battle-start`: no log entries at all are kept.
- The only function with any kept entries is `mcp`. Its newest entries are "shutdown" lines from 2026-11-01 21:48 UTC, a few minutes before this check. Nothing older came back.
- Queries on the stored request logs (function requests, function console logs, gateway logs) returned no rows at all, even without a date filter. So I can't tell exactly how far back they go. In practice the history is only minutes to hours, not days.

## What this means
- No status codes, durations, errors, friendly codes or model names can be recovered for 2026-10-28 08:18–08:20 or 2026-10-25 05:45–06:00 UTC.
- I'm not guessing at a cause.

## Possible next step (only if you approve)
- Read-only database check: compare the `chat_analytics` rows from both windows with `agent_chats` and `analytics_events` (models requested, timestamps, any message rows). This shows what the app recorded, not what the functions did.
- For future cases: log a single compact line per `openrouter-chat` call (status, friendly code, model, duration, hashed IP) to a database table, so it outlasts the short log history.
