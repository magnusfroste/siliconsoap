# Landing and debate-link fixes

## Changes
- Give the three fixed archive debates curated headlines while retaining live model chips, and clamp headlines to four lines.
- Use natural origin wording in roster sentences without changing compact origin labels.
- Restyle the landing Hall of Shame to match the landing page, show the real flagged agent name, replace emojis with severity bars, and preserve links to shared debates.
- Correct the existing Hall of Shame attribution to display the stored agent name directly.
- Point both shared-debate rerun actions to `/new` with the current prompt and update their labels.
- Replace the broken `/login` link on `/new` with the app’s `/auth` route.

## Verification
- Run the project typecheck and build checks.
- Check the current build diagnostics after changes.
- Verify the affected landing, shared-debate, and new-debate states in desktop and mobile-sized previews.
