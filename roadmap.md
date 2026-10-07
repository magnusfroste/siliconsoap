# Roadmap

## Landing and debate-link fixes (approved)
- [x] Curated archive headlines for the three fixed debates + clamp titles to 4 lines
- [x] Natural origin wording in roster sentences ("from the United States")
- [x] Landing Hall of Shame: real agent attribution, "Flagged:" label, link to shared debate, new-style restyle, new subheading
- [x] Fix attribution in the in-app HallOfShame component (no restyle)
- [x] Shared debate CTAs → /new?prompt=..., renamed to "Rerun with your own cast"
- [x] /new sign-in link → /auth via router Link
- [x] Typecheck + build

## Debate page design makeover (approved)
- [x] Self-host fonts and remap global semantic tokens
- [x] Add reusable model chips and slot-colored agent avatar
- [x] Restyle the app sidebar and mobile header
- [x] Rebuild `/new` with the three-step layout, smart cast defaults, summary rail, and mobile action bar
- [x] Rebuild `/shared/:shareId` with transcript controls, source-free number flags, cast rail, and rerun bands
- [x] Verify typecheck, build, light/dark desktop and mobile layouts, and prompt-prefill reruns

## Chat presentation makeover (approved)
- [ ] Extract shared message rendering and round grouping for /shared and /chat
- [ ] Restyle chat header, live progress, answering state, pauses, completion, input, and audio controls without changing generation handlers
- [ ] Restyle judge results/drawer and sidebar statuses
- [ ] Verify guest generation, round pause/skip, human turns, themes, mobile, and preview diagnostics
