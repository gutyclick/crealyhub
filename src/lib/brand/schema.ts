import { z } from "zod";

export const brandFormSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(120),
  description: z.string().trim().max(1200),
  productService: z.string().trim().max(1200),
  website: z.union([z.literal(""), z.url("Introduce una URL válida")]),
  audience: z.string().trim().max(1200),
  objectives: z.string().trim().max(1200),
  tone: z.string().trim().max(600),
  personality: z.string().trim().max(600),
  defaultCta: z.string().trim().max(300),
  language: z.string().trim().min(2).max(10),
  timezone: z.string().trim().min(1).max(80),
  allowedPhrases: z.string(),
  forbiddenPhrases: z.string(),
  hashtagRules: z.string().trim().max(1200),
  editorialRules: z.string().trim().max(2000),
});

export type BrandFormValues = z.infer<typeof brandFormSchema>;
