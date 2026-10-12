# Roadmap

## Agent pivot A fixes and B
- [x] Constrained fallbacks, synthesis attribution, validate-before-charge/refund, guest pricing and batch cap
- [x] Atomic claim and account connector creation
- [x] /connect, navigation, landing section and panel history/synthesis
- [x] Tests, function deployment, desktop/mobile verification and revoke the single test link
- [ ] Signed-in automatic claim/account-link and owned transcript UI verification — no requesting-user account/session available; no test accounts permitted

## Explore and favicon
- [x] Build editorial Explore, featured transcript quote, URL filters and paged complete-debate archive
- [x] Install supplied icons, SVG, manifest and head links
- [x] Run tests and verify public archive, filters, light/dark and 375px layouts (72 pass; 6 known credit failures)

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
- [x] Extract shared message rendering and round grouping for /shared and /chat
- [x] Restyle chat header, live progress, answering state, pauses, completion, input, and audio controls without changing generation handlers
- [x] Restyle judge results/drawer and sidebar statuses
- [x] Verify real guest generation, elapsed counter, pause/reply/skip, human turns, light/dark transcript, 375px completion, and preview diagnostics; 25 presentation tests pass
- [ ] Verify enabled Judge Bot and audio flows end-to-end — blocked by their current disabled feature flags; no configuration changes requested

## Site refresh batch 1
- [x] Editorial models, scoreboard, auth, about, learn and 404
- [x] Aggregate scoreboard RPC and rule tests
- [x] Navigation redirects, 92 tests and desktop/mobile verification

## Site refresh batch 2
- [x] Correct scoreboard original-only behaviour metrics and SQL regression tests
- [x] Refresh profile, settings, roles, status, payment success, API docs and admin presentation
- [x] Confirm all six public navigation links and no legacy leaderboard links
- [x] Run app and SQL tests; verify public/signed-out desktop/375px in both themes
- [ ] Verify signed-in profile/settings/admin and paid-success state — blocked: no authorized session for requesting account; no test users created

## Batch 2 cleanup
- [x] Nav order editor: scoreboard + connect keys, keys preserved on save (pure service + tests)
- [x] Delete dead LeaderboardView, its unused skeleton and dead query invalidation
- [x] Status page meta and neutral no-session payment state
- [ ] Stale `/leaderboard` entries in `public/sitemap.xml`, `public/robots.txt`, `public/llms.txt` and the sitemap function — awaiting the user's go-ahead to edit SEO files and redeploy

