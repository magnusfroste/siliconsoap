import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, invokeFunction, ok, requireAuth } from "../supabase";

export default defineTool({
  name: "create_debate",
  title: "Create a debate",
  description:
    "Queue a new multi-agent debate on SiliconSoap as the signed-in user. Costs 1 credit. Returns immediately with a debate id — poll `get_debate_status` until it is completed, then read it with `get_debate`.",
  inputSchema: {
    topic: z.string().describe("The debate topic or question (max 2000 chars)."),
    models: z
      .array(z.string())
      .describe("2 or 3 model ids from `list_models` — one per agent."),
    rounds: z.number().int().optional().describe("1-5, default 2."),
    scenario_id: z
      .enum(["general-problem", "ethical-dilemma", "future-prediction"])
      .optional(),
    personas: z
      .array(z.enum(["analytical", "creative", "strategic", "empathetic"]))
      .optional()
      .describe("One persona per agent."),
    agent_names: z.array(z.string()).optional().describe("Display names per agent."),
    response_length: z.enum(["short", "medium", "long"]).optional(),
    conversation_tone: z
      .enum(["formal", "casual", "heated", "collaborative"])
      .optional(),
    agreement_bias: z
      .number()
      .int()
      .optional()
      .describe("0 = combative, 100 = agreeable. Default 50."),
    personality_intensity: z.enum(["mild", "moderate", "extreme"]).optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
  handler: async (input, ctx) => {
    requireAuth(ctx);
    if (!input.topic.trim()) return fail("`topic` cannot be empty.");
    if (input.models.length < 2 || input.models.length > 3) {
      return fail("`models` must contain 2 or 3 model ids (see `list_models`).");
    }
    const { status, body } = await invokeFunction(ctx, "debates-api", {
      method: "POST",
      path: "/debates",
      body: input,
    });
    if (status >= 400) {
      const message =
        (body as { error?: string })?.error ?? `Debate creation failed (${status}).`;
      return fail(message);
    }
    return ok(body as Record<string, unknown>);
  },
});
