// lib/component-schema.ts
import { z } from "zod";

export const ComponentSchema = z.enum([
  "heading",
  "paragraph",
  "button",
  "input",
  "image",
  "section",
]);

export const UIPlanSchema = z.object({
  layout: z.enum(["single-column", "two-column", "centered"]).optional(),

  components: z.array(
    z.object({
      type: ComponentSchema,
      props: z.record(z.string(), z.any()).optional(),
      children: z.string().nullable().optional(),
    })
  ),
});