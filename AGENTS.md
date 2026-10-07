# Architecture rules

- Share debate transcript rendering and display-only round/claim derivation between owned and public views so their presentation cannot drift.
- Keep chat generation, accounting, persistence, playback, and analysis handlers unchanged during presentation updates; new presentation components receive their existing handlers as props.
- Preserve the legacy plain-text transcript and composer for this presentation-only change: AI Elements MessageResponse's Markdown rendering is incompatible with exact sentence highlighting and audio-timed character reveal, and migrating the composer/transcript foundations would change the explicitly preserved input/playback behaviour.