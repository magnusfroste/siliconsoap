import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { audited, fail, invokeFunction, isAdmin, ok, requireAuth } from "../supabase";

const PERSONA_INSTRUCTIONS: Record<string, string> = {
  analytical: "You are rigorously analytical: evidence, trade-offs and precise reasoning.",
  creative: "You are creative and provocative: unexpected angles and vivid framing.",
  strategic: "You are strategic: incentives, second-order effects and long-term power dynamics.",
  empathetic: "You are empathetic: human impact, fairness and lived consequences.",
};

export default defineTool({
  name: "seed_featured_debate",
  title: "Seed a featured debate",
  description:
    "Admin only. Generate a complete public editorial debate on SiliconSoap (visible on /explore) with the given topic and agents. No views or reactions are seeded by default. Set featured=false and series='daily' for Today's debate without replacing the weekly showdown. Use `list_models` to pick model ids. Unlike `create_debate` this runs as the platform's demo account, not as a personal debate.",
  inputSchema: {
    topic: z.string().describe("Short headline for the debate."),
    prompt: z.string().optional().describe("Full question the agents debate. Defaults to `topic`."),
    models: z.array(z.string()).describe("2 or 3 model ids from `list_models`."),
    agent_names: z.array(z.string()).optional().describe("Display names, one per agent."),
    personas: z
      .array(z.enum(["analytical", "creative", "strategic", "empathetic"]))
      .optional()
      .describe("One persona per agent. Defaults cycle through the four personas."),
    scenario_id: z
      .enum(["general-problem", "ethical-dilemma", "future-prediction"])
      .optional()
      .describe("Defaults to 'general-problem'."),
    target_date: z.string().optional().describe("ISO date to backdate the debate to. Defaults to now."),
    featured: z.boolean().optional().describe("Feature as the weekly showdown. Default true; use false for daily debates."),
    series: z.string().max(32).optional().describe("Optional editorial series, e.g. 'daily'. Maximum 32 characters."),
    view_count_min: z.number().int().optional().describe("Minimum seeded views. Default 0 (no fabricated engagement)."),
    view_count_max: z.number().int().optional().describe("Maximum seeded views. Default 0 (no fabricated engagement)."),
    reaction_count: z.number().int().optional().describe("Number of seeded reactions. Default 0 (no fabricated engagement)."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
  handler: async (input, ctx) => {
    requireAuth(ctx);
    if (!(await isAdmin(ctx))) return fail("Admin role required.");
    if (!input.topic.trim()) return fail("`topic` cannot be empty.");
    if (input.models.length < 2 || input.models.length > 3) {
      return fail("`models` must contain 2 or 3 model ids (see `list_models`).");
    }

    const personaOrder = ["analytical", "creative", "strategic"] as const;
    const agents = input.models.map((model, index) => {
      const persona = input.personas?.[index] ?? personaOrder[index % personaOrder.length];
      return {
        name: input.agent_names?.[index] ?? `Agent ${String.fromCharCode(65 + index)}`,
        model,
        persona,
        personaInstructions: PERSONA_INSTRUCTIONS[persona] ?? PERSONA_INSTRUCTIONS.analytical,
      };
    });

    return audited(
      ctx,
      {
        tool_name: "seed_featured_debate",
        action: "create",
        target_type: "debate",
        target_id: input.topic,
        input,
      },
      async () => {
        const { status, body } = await invokeFunction(ctx, "seed-debates", {
          method: "POST",
          body: {
            topic: input.topic.trim(),
            prompt: (input.prompt ?? input.topic).trim(),
            targetDate: input.target_date ?? new Date().toISOString(),
            agents,
            viewCountMin: input.view_count_min ?? 0,
            viewCountMax: input.view_count_max ?? 0,
            reactionCount: input.reaction_count ?? 0,
            scenarioId: input.scenario_id ?? "general-problem",
            featured: input.featured ?? true,
            series: input.series,
          },
        });
        if (status >= 400) {
          const message =
            (body as { error?: string })?.error ?? `Seeding failed (${status}).`;
          return fail(message);
        }
        const payload =
          typeof body === "object" && body !== null
            ? (body as Record<string, unknown>)
            : { result: body };
        const shareId = payload.shareId ?? payload.share_id;
        const chatId = payload.chatId ?? payload.chat_id ?? payload.id ?? null;
        return ok({
          ...payload,
          chatId,
          share_url: typeof shareId === "string" ? `https://siliconsoap.com/shared/${shareId}` : null,
        });
      },
    );
  },
});
