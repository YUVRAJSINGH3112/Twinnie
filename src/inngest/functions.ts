import { inngest } from "./client";
import { gemini, createAgent } from "@inngest/agent-kit";
import {
  plannerPrompt,
  generatorPrompt,
  explainerPrompt,
} from "@/lib/prompts";
import { UIPlanSchema } from "@/lib/component-schema";


export const codingAgent = inngest.createFunction(
  { id: "coding-agent" },
  { event: "coding/generate" },
  async ({ event }) => {
    const prompt = event.data.prompt;

    /* -------- Planner -------- */

    const planner = createAgent({
      name: "UI Planner",
      model: gemini({ model: "gemini-2.5-flash" }),
      system: plannerPrompt,
    });

    const { output: planRaw } = await planner.run(`
User request:
${prompt}

Respond with JSON only.
`);

    const cleaned = planRaw
      .map((m: any) => m.content)
      .join("")
      .replace(/```json|```/g, "")
      .trim();

    const plan = UIPlanSchema.parse(JSON.parse(cleaned));

    /* -------- Generator -------- */

    const generator = createAgent({
      name: "UI Generator",
      model: gemini({ model: "gemini-2.5-flash" }),
      system: generatorPrompt,
    });

    const { output: codeRaw } = await generator.run(`
      UI Plan:
      ${JSON.stringify(plan)}

      Generate React code.
    `);

    const code = codeRaw.map((m: any) => m.content).join("");

    /* -------- Explainer -------- */

    const explainer = createAgent({
      name: "UI Explainer",
      model: gemini({ model: "gemini-2.5-flash" }),
      system: explainerPrompt,
    });

    const { output: explanationRaw } = await explainer.run(`
      Explain this UI plan:
      ${JSON.stringify(plan)}
    `);

    const explanation = explanationRaw.map((m: any) => m.content).join("");

    return { plan, code, explanation };
  }
);
