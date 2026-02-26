import { inngest } from "./client";
import { gemini, createAgent } from "@inngest/agent-kit";
import {
  plannerPrompt,
  generatorPrompt,
  explainerPrompt,
} from "@/lib/prompts";
import { UIPlanSchema } from "@/lib/component-schema";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandboxUrl } from "./util";

export const codingAgent = inngest.createFunction(
  { id: "coding-agent" },
  { event: "coding/generate" },
  async ({ event,step }) => {

    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("yuvrajsingh3112s/vibe-nextjs-test-5");
      return sandbox.sandboxId;
    });
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

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandboxUrl(sandboxId);
      const host= sandbox.getHost(3000);
      return `http://${host}`;
    });

    return { plan, code, explanation,sandboxUrl };
  }
);
