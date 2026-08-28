import { env } from "@/lib/env";
import { contentPlanSchema } from "@/lib/ai/schemas";
import type { AIProvider } from "@/lib/ai/types";
import type { BrandContext } from "@/lib/brand/context";

export function planContent(provider: AIProvider, brand: BrandContext, recent: unknown, count: number, request?: string) {
  return provider.generateStructured({ operation:"content_plan", model:env.OPENAI_STRATEGY_MODEL,
    schema:contentPlanSchema, schemaName:"content_plan",
    instructions:"Actúa como estratega editorial senior. Prioriza intención, variedad y utilidad. Evita repetir temas, hooks y CTA recientes. Usa las señales de rendimiento solo cuando tengan muestra suficiente; ningún post aislado debe dominar la estrategia. Los porcentajes editoriales son objetivos flexibles. No inventes campos fuera del contrato. Devuelve únicamente el resultado estructurado.",
    input:JSON.stringify({ brand, recentContent:recent, requestedIdeas:count, userRequest:request??null }),
  });
}
