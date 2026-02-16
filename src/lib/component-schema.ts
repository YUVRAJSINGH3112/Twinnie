// lib/component-schema.ts
import { z } from "zod";

export const ComponentSchema = z.enum([
  "Button",
  "Card",
  "Input",
  "Modal",
  "Sidebar",
  "Navbar",
  "Table",
]);

export const UIPlanSchema = z.object({
  layout: z.string().optional(),
  components: z.array(
    z.object({
      type: ComponentSchema,
      props: z.record(z.string(), z.any()),
      children: z.any().optional(),
    })
  ),
});
