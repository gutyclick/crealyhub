import { env } from "@/lib/env";
import { visualPromptSchema } from "@/lib/ai/schemas";
import type { AIProvider } from "@/lib/ai/types";
import type { BrandContext } from "@/lib/brand/context";
export function buildVisualPrompt(provider:AIProvider,brand:BrandContext,concept:unknown,format:string){return provider.generateStructured({operation:"visual_prompt",model:env.OPENAI_STRATEGY_MODEL,schema:visualPromptSchema,schemaName:"visual_prompt",instructions:"Convierte el concepto editorial en una especificación visual ejecutable. Define sujeto, composición, dirección artística, paleta y restricciones. Reserva áreas seguras para texto y evita logos o texto generado ilegible.",input:JSON.stringify({brand,concept,format})})}
