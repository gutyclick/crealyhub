import { z } from "zod";

export const contentIdeaSchema = z.object({
  topic: z.string().min(3), objective: z.string().min(2),
  format: z.enum(["POST", "STORY", "CAROUSEL"]), hook: z.string().min(3),
  concept: z.string().min(10), visualDirection: z.string().min(10),
  strategyReason: z.string().min(10), noveltyScore: z.number().min(0).max(1),
});
export const contentPlanSchema = z.object({
  editorialSummary: z.string(), ideas: z.array(contentIdeaSchema).min(1).max(21),
});
export const copyPackageSchema = z.object({
  hook: z.string(), caption: z.string(), cta: z.string(),
  hashtags: z.array(z.string()).max(12), altText: z.string(),
});
export const carouselSlideSchema = z.object({
  position: z.number().int().min(1).max(10), role: z.enum(["hook","problem","insight","proof","step","transition","cta"]),
  headline: z.string(), body: z.string(), visualInstruction: z.string(),
});
export const carouselPlanSchema = z.object({
  topic: z.string(), objective: z.string(), hook: z.string(), cta: z.string(),
  visualDirection: z.string(), slides: z.array(carouselSlideSchema).min(2).max(10),
});
export const visualPromptSchema = z.object({
  subject: z.string(), composition: z.string(), artDirection: z.string(),
  palette: z.array(z.string()).min(2).max(6), displayText: z.string().min(2).max(90),
  typographyGuidance: z.string(), textPlacement: z.string(),
  negativeInstructions: z.array(z.string()).max(12),
});
export type ContentIdea = z.infer<typeof contentIdeaSchema>;
export type CopyPackage = z.infer<typeof copyPackageSchema>;
export type CarouselPlan = z.infer<typeof carouselPlanSchema>;
export type VisualPrompt = z.infer<typeof visualPromptSchema>;
