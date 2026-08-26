import "server-only";
import { z } from "zod";

const serverSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  CRON_SECRET: z.string().min(16).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  APP_TIMEZONE: z.string().default("America/Panama"),
  OPENAI_STRATEGY_MODEL: z.string().default("gpt-5.6-terra"),
  OPENAI_COPY_MODEL: z.string().default("gpt-5.6-luna"),
  OPENAI_IMAGE_MODEL: z.string().default("gpt-image-2"),
  OPENAI_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(90_000),
  AUTOPILOT_ENABLED: z.enum(["true", "false"]).default("false"),
  SUPABASE_STORAGE_BUCKET: z.string().default("content-media"),
  MONTHLY_AI_BUDGET_USD: z.coerce.number().nonnegative().default(100),
  MAX_IMAGES_PER_DAY: z.coerce.number().int().positive().default(12),
  MAX_REGENERATIONS_PER_POST: z.coerce.number().int().nonnegative().default(3),
  MAX_CONCURRENT_GENERATIONS: z.coerce.number().int().positive().max(10).default(2),
  AI_TEXT_INPUT_USD_PER_MILLION: z.coerce.number().nonnegative().default(2.5),
  AI_TEXT_OUTPUT_USD_PER_MILLION: z.coerce.number().nonnegative().default(15),
  AI_IMAGE_INPUT_USD_PER_MILLION: z.coerce.number().nonnegative().default(8),
  AI_IMAGE_OUTPUT_USD_PER_MILLION: z.coerce.number().nonnegative().default(32),
});

export const env = serverSchema.parse(process.env);

export const hasSupabaseEnv = Boolean(
  env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
