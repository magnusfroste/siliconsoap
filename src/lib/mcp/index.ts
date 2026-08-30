import { auth, defineMcp } from "@lovable.dev/mcp-js";

import createDebate from "./tools/create-debate";
import getDebate from "./tools/get-debate";
import getDebateStatus from "./tools/get-debate-status";
import listAgentActivity from "./tools/list-agent-activity";
import listAgentProfiles from "./tools/list-agent-profiles";
import listContentDrafts from "./tools/list-content-drafts";
import listDebates from "./tools/list-debates";
import listFeatureFlags from "./tools/list-feature-flags";
import listHallOfShame from "./tools/list-hall-of-shame";
import listModels from "./tools/list-models";
import listMyDebates from "./tools/list-my-debates";
import listOpenRouterModels from "./tools/list-openrouter-models";
import listQuickPrompts from "./tools/list-quick-prompts";
import manageContentDrafts from "./tools/manage-content-drafts";
import manageQuickPrompts from "./tools/manage-quick-prompts";
import seedFeaturedDebate from "./tools/seed-featured-debate";
import setFeatureFlag from "./tools/set-feature-flag";
import siteStats from "./tools/site-stats";
import syncModelPricing from "./tools/sync-model-pricing";
import upsertAgentProfile from "./tools/upsert-agent-profile";
import upsertCuratedModel from "./tools/upsert-curated-model";
import whoami from "./tools/whoami";

// The OAuth issuer must be the direct Supabase host, built from the project ref
// (inlined at build time), never from SUPABASE_URL.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "siliconsoap",
  title: "siliconsoap",
  version: "1.0.0",
  instructions: [
    "SiliconSoap is a platform where multiple LLM agents debate a topic in rounds, soap-opera style.",
    "",
    "Read tools (no special role needed): `site_stats`, `list_models`, `list_debates`, `get_debate`,",
    "`list_quick_prompts`, `list_feature_flags`, `list_agent_profiles`, `list_hall_of_shame`,",
    "`list_my_debates`, `whoami`.",
    "",
    "Run a debate: `list_models` -> `create_debate` (costs 1 credit) -> poll `get_debate_status`",
    "until status is 'completed' -> `get_debate` for the transcript and share URL.",
    "",
    "Platform maintenance (admin role required): `list_openrouter_models` to discover newly",
    "released models, `upsert_curated_model` to add/update the roster, `sync_model_pricing` to",
    "refresh pricing and reasoning support, `manage_quick_prompts` to keep suggested topics fresh,",
    "and `set_feature_flag` to change live configuration (feature flags are the source of truth).",
    "Always read current state before writing, and report what you changed.",
  ].join("\n"),
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    siteStats,
    listModels,
    listDebates,
    getDebate,
    listQuickPrompts,
    listFeatureFlags,
    listAgentProfiles,
    listHallOfShame,
    whoami,
    listMyDebates,
    createDebate,
    getDebateStatus,
    listOpenRouterModels,
    upsertCuratedModel,
    syncModelPricing,
    manageQuickPrompts,
    setFeatureFlag,
    upsertAgentProfile,
    seedFeaturedDebate,
    manageContentDrafts,
    listContentDrafts,
    listAgentActivity,
  ],
});
