import "server-only";
import { z } from "zod";

const serverSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  APP_TIMEZONE: z.string().default("America/Panama"),
  OPENAI_STRATEGY_MODEL: z.string().default("gpt-5.6-terra"),
  OPENAI_COPY_MODEL: z.string().default("gpt-5.6-luna"),
  OPENAI_IMAGE_MODEL: z.string().default("gpt-image-2"),
  OPENAI_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(90_000),
  AUTOPILOT_ENABLED: z.enum(["true", "false"]).default("false"),
  SUPABASE_STORAGE_BUCKET: z.string().default("content-media"),
});

export const env = serverSchema.parse(process.env);

export const hasSupabaseEnv = Boolean(
  env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
