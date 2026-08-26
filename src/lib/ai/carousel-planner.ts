import { env } from "@/lib/env";
import { carouselPlanSchema } from "@/lib/ai/schemas";
import type { AIProvider } from "@/lib/ai/types";
import type { BrandContext } from "@/lib/brand/context";
export function planCarousel(provider:AIProvider,brand:BrandContext,idea:unknown){return provider.generateStructured({operation:"carousel_plan",model:env.OPENAI_STRATEGY_MODEL,schema:carouselPlanSchema,schemaName:"carousel_plan",instructions:"Diseña primero la narrativa completa del carrusel. Cada slide debe conocer su función en la progresión. Usa 2 a 10 slides, poco texto, un hook concreto y un CTA natural. Mantén una única dirección artística.",input:JSON.stringify({brand,idea})})}
